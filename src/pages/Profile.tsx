
import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";

import {
  Loader2,
  User,
  Phone,
  Mail,
  MapPin,
  Camera,
  Package,
  Heart,
  ShieldCheck,
  LogOut,
  Store,
  ExternalLink,
  Search,
  ArrowLeft,
  Image as ImageIcon,
} from "lucide-react";

import * as SeoModule from "@/hooks/useSeo";

const Seo =
  (SeoModule as any).Seo ||
  (SeoModule as any).default ||
  (() => null);

const LOCATIONS = [
  "Mbabane",
  "Manzini",
  "Matsapha",
  "Siteki",
  "Big Bend",
  "Nhlangano",
  "Piggs Peak",
];

type ProfileRecord = {
  user_id: string;
  name?: string | null;
  phone?: string | null;
  location?: string | null;
  avatar_url?: string | null;
  [key: string]: unknown;
};

type AdvertisementRecord = Record<string, unknown> & {
  user_id: string;
  id?: string | number;
};

const asText = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
};

const firstText = (
  record: Record<string, unknown>,
  keys: string[],
): string => {
  for (const key of keys) {
    const value = asText(record[key]).trim();
    if (value) return value;
  }
  return "";
};

const getListingTitle = (
  ad: AdvertisementRecord,
): string => {
  return (
    firstText(ad, [
      "title",
      "name",
      "product_name",
      "business_name",
      "headline",
      "listing_title",
    ]) || "Marketplace listing"
  );
};

const getListingDescription = (
  ad: AdvertisementRecord,
): string => {
  return firstText(ad, [
    "description",
    "details",
    "content",
    "summary",
  ]);
};

const getListingImage = (
  ad: AdvertisementRecord,
): string => {
  const directImage = firstText(ad, [
    "image_url",
    "image",
    "thumbnail_url",
    "cover_image",
    "photo_url",
    "featured_image",
  ]);

  if (directImage) return directImage;

  for (const key of ["images", "photos", "image_urls"]) {
    const value = ad[key];

    if (Array.isArray(value)) {
      const first = value.find(
        (item) => typeof item === "string" && item.trim(),
      );
      if (typeof first === "string") return first;
    }

    if (typeof value === "string" && value.trim()) {
      try {
        const parsed: unknown = JSON.parse(value);
        if (Array.isArray(parsed)) {
          const first = parsed.find(
            (item) => typeof item === "string" && item.trim(),
          );
          if (typeof first === "string") return first;
        }
      } catch {
        // The field may contain a single URL rather than JSON.
        if (/^https?:\/\//i.test(value)) return value;
      }
    }
  }

  return "";
};

const getListingPrice = (
  ad: AdvertisementRecord,
): string => {
  const raw = firstText(ad, [
    "price",
    "amount",
    "asking_price",
    "sale_price",
    "listing_price",
  ]);

  if (!raw) return "";

  const currency = firstText(ad, [
    "currency",
    "currency_code",
  ]);

  // Keep the database's price representation rather than
  // guessing the currency or changing its value.
  return currency ? `${currency} ${raw}` : raw;
};

const getListingId = (
  ad: AdvertisementRecord,
  index: number,
): string => {
  return asText(ad.id) || `listing-${index}`;
};

const isPubliclyListed = (
  ad: AdvertisementRecord,
): boolean => {
  // Accommodate common status conventions when such a field
  // exists. If the schema has no status field, do not invent one.
  const status = firstText(ad, [
    "status",
    "listing_status",
    "moderation_status",
  ]).toLowerCase();

  if (!status) return true;

  return [
    "active",
    "approved",
    "published",
    "live",
  ].includes(status);
};

const ProfilePage = () => {
  const { sellerId } = useParams<{ sellerId: string }>();
  const isPublicStorefront = Boolean(sellerId);

  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [listingSearch, setListingSearch] = useState("");

  // The public route uses the seller ID in the URL.
  // The private route always uses the authenticated user's ID.
  const targetUserId = isPublicStorefront
    ? sellerId
    : user?.id;

  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ["profile", targetUserId],
    queryFn: async (): Promise<ProfileRecord | null> => {
      if (!targetUserId) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", targetUserId)
        .maybeSingle();

      if (error) throw error;
      return data as ProfileRecord | null;
    },
    enabled: Boolean(targetUserId) &&
      (isPublicStorefront || Boolean(user?.id)),
  });

  const {
    data: advertisements = [],
    isLoading: adsLoading,
    error: adsError,
  } = useQuery({
    queryKey: ["seller-storefront-ads", targetUserId],
    queryFn: async (): Promise<AdvertisementRecord[]> => {
      if (!targetUserId) return [];

      // user_id is already used by your existing ads counter.
      // select("*") avoids assuming unverified product columns.
      const { data, error } = await supabase
        .from("advertisements")
        .select("*")
        .eq("user_id", targetUserId);

      if (error) throw error;
      return (data ?? []) as AdvertisementRecord[];
    },
    enabled: Boolean(targetUserId) &&
      (isPublicStorefront || Boolean(user?.id)),
  });

  const visibleAdvertisements = useMemo(() => {
    const publicAds = advertisements.filter(isPubliclyListed);
    const search = listingSearch.trim().toLowerCase();

    if (!search) return publicAds;

    return publicAds.filter((ad) => {
      const searchable = [
        getListingTitle(ad),
        getListingDescription(ad),
        getListingPrice(ad),
        firstText(ad, ["category", "type"]),
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(search);
    });
  }, [advertisements, listingSearch]);

  // Only populate editable fields on the private profile route.
  useEffect(() => {
    if (isPublicStorefront) return;

    if (profile) {
      setName(asText(profile.name));
      setPhone(asText(profile.phone));
      setLocation(asText(profile.location));
      setAvatarUrl(asText(profile.avatar_url));
    } else if (user?.user_metadata?.full_name) {
      setName(user.user_metadata.full_name);
    }
  }, [profile, user, isPublicStorefront]);

  // Public storefronts do not require authentication.
  // Only the private profile route redirects to login.
  useEffect(() => {
    if (
      !isPublicStorefront &&
      !authLoading &&
      !user
    ) {
      navigate("/login", { replace: true });
    }
  }, [isPublicStorefront, authLoading, user, navigate]);

  const updateProfileMutation = useMutation({
    mutationFn: async (updatedData: {
      name: string;
      phone: string | null;
      location: string | null;
      avatar_url: string | null;
    }) => {
      if (!user?.id) {
        throw new Error("Please sign in to update your profile.");
      }

      const { error } = await supabase
        .from("profiles")
        .upsert(
          {
            user_id: user.id,
            ...updatedData,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );

      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["profile", user?.id],
      });

      toast.success("Profile saved successfully.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile.");
    },
  });

  const handleAvatarUpload = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    // Reset the input so the same file can be selected again.
    event.target.value = "";

    if (!file) return;

    if (!user?.id) {
      toast.error("Please sign in before changing your photo.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Please choose an image smaller than 5 MB.");
      return;
    }

    try {
      setUploadingAvatar(true);

      const fileExt = file.name.split(".").pop() || "jpg";
      const filePath =
        `${user.id}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;

      // Save the new URL together with the current form values.
      const trimmedName = name.trim();

      if (!trimmedName) {
        setAvatarUrl(publicUrl);
        toast.success(
          "Photo uploaded. Add your name and save your profile.",
        );
        return;
      }

      setAvatarUrl(publicUrl);

      await updateProfileMutation.mutateAsync({
        name: trimmedName,
        phone: phone.trim() || null,
        location: location || null,
        avatar_url: publicUrl,
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to upload profile photo.",
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName || trimmedName.length > 100) {
      toast.error("Name must be between 1 and 100 characters.");
      return;
    }

    if (
      trimmedPhone &&
      !/^[\d\s\-+()]{7,20}$/.test(trimmedPhone)
    ) {
      toast.error("Please enter a valid phone number.");
      return;
    }

    updateProfileMutation.mutate({
      name: trimmedName,
      phone: trimmedPhone || null,
      location: location || null,
      avatar_url: avatarUrl || null,
    });
  };

  const hasChanges =
    name !== asText(profile?.name) ||
    phone !== asText(profile?.phone) ||
    location !== asText(profile?.location) ||
    avatarUrl !== asText(profile?.avatar_url);

  const displayName =
    asText(profile?.name) ||
    (!isPublicStorefront
      ? user?.user_metadata?.full_name
      : "") ||
    "Market Hub Seller";

  const displayEmail = isPublicStorefront
    ? ""
    : user?.email || "";

  const profileInitials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const publicStoreUrl = targetUserId
    ? `/store/${encodeURIComponent(targetUserId)}`
    : "";

  if (
    authLoading && !isPublicStorefront
  ) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Checking your account...
        </p>
      </div>
    );
  }

  if (
    !isPublicStorefront &&
    !user
  ) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Loading seller information...
        </p>
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <main className="container mx-auto max-w-3xl px-4 py-16">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <Store className="h-10 w-10 text-muted-foreground" />
            <h1 className="text-xl font-semibold">
              {isPublicStorefront
                ? "Storefront unavailable"
                : "Your profile is not ready"}
            </h1>
            <p className="max-w-md text-sm text-muted-foreground">
              {profileError
                ? "We could not load this seller's profile. Check the database permissions and try again."
                : "No profile record was found. Make sure your profile exists in Supabase before opening this page."}
            </p>
            {!isPublicStorefront && (
              <Button onClick={() => navigate("/")}>
                Return to marketplace
              </Button>
            )}
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-6xl space-y-6 px-4 py-6 md:py-10">
      {Seo && (
        <Seo
          title={
            isPublicStorefront
              ? `${displayName} | Market Hub Storefront`
              : "My Store & Profile Settings | Market Hub"
          }
          description={
            isPublicStorefront
              ? `Explore marketplace listings from ${displayName}${profile.location ? ` in ${profile.location}, Eswatini` : ""}.`
              : "Manage your Market Hub storefront and account settings."
          }
        />
      )}

      {/* Storefront identity */}
      <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-background p-5 md:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar className="h-24 w-24 border-4 border-background shadow-md md:h-28 md:w-28">
            <AvatarImage
              src={asText(profile.avatar_url)}
              alt={`${displayName} profile`}
            />
            <AvatarFallback className="bg-primary/10 text-2xl font-bold text-primary">
              {profileInitials || <User className="h-10 w-10" />}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                {displayName}
              </h1>
              <Badge variant="secondary" className="gap-1">
                <Store className="h-3.5 w-3.5" />
                Seller storefront
              </Badge>
            </div>

            {profile.location && (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                {asText(profile.location)}, Eswatini
              </p>
            )}

            {displayEmail && (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {displayEmail}
              </p>
            )}

            {isPublicStorefront && (
              <p className="text-sm text-muted-foreground">
                Browse this seller's public marketplace listings.
              </p>
            )}
          </div>

          {!isPublicStorefront && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => navigate(publicStoreUrl)}
              >
                <ExternalLink className="h-4 w-4" />
                View public store
              </Button>
              <Button
                variant="ghost"
                className="gap-2"
                onClick={() => signOut?.()}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Store overview */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {adsLoading ? "—" : visibleAdvertisements.length}
              </p>
              <p className="text-xs text-muted-foreground">
                {listingSearch ? "Matching listings" : "Public listings"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-semibold">Favorites</p>
              <p className="text-xs text-muted-foreground">
                {isPublicStorefront
                  ? "Buyers manage their own favorites"
                  : "Manage saved items in your account"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-xl bg-muted p-3 text-muted-foreground">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-semibold">Market Hub</p>
              <p className="text-xs text-muted-foreground">
                Seller profile
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Public store: listings only */}
      {isPublicStorefront ? (
        <section className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                Store listings
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Explore products advertised by this seller.
              </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={listingSearch}
                onChange={(event) => setListingSearch(event.target.value)}
                placeholder="Search this store..."
                className="pl-9"
                aria-label="Search seller listings"
              />
            </div>
          </div>

          {adsError ? (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                Listings could not be loaded. Check the advertisements table's
                public read policy in Supabase.
              </CardContent>
            </Card>
          ) : adsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          ) : visibleAdvertisements.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
                <Package className="h-10 w-10 text-muted-foreground" />
                <h3 className="font-semibold">
                  {listingSearch
                    ? "No matching listings"
                    : "No public listings yet"}
                </h3>
                <p className="max-w-sm text-sm text-muted-foreground">
                  {listingSearch
                    ? "Try a different search term."
                    : "This seller has not published any visible advertisements."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleAdvertisements.map((ad, index) => {
                const title = getListingTitle(ad);
                const description = getListingDescription(ad);
                const imageUrl = getListingImage(ad);
                const price = getListingPrice(ad);

                return (
                  <Card
                    key={getListingId(ad, index)}
                    className="overflow-hidden transition-shadow hover:shadow-md"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-muted">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>

                    <CardContent className="space-y-3 p-4">
                      <div className="space-y-1">
                        <h3 className="line-clamp-2 font-semibold">
                          {title}
                        </h3>

                        {price && (
                          <p className="text-lg font-bold text-primary">
                            {price}
                          </p>
                        )}

                        {description && (
                          <p className="line-clamp-3 text-sm text-muted-foreground">
                            {description}
                          </p>
                        )}
                      </div>

                      {firstText(ad, ["category", "type"]) && (
                        <Badge variant="outline">
                          {firstText(ad, ["category", "type"])}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      ) : (
        /* Private settings: available only to the signed-in seller */
        <Tabs defaultValue="store" className="space-y-5">
          <TabsList className="grid h-auto w-full grid-cols-3 sm:max-w-lg">
            <TabsTrigger value="store" className="gap-2">
              <Store className="h-4 w-4" />
              My Store
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <ShieldCheck className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="store" className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle>Your public storefront</CardTitle>
                <CardDescription>
                  This is the public URL buyers can visit. Only public,
                  permitted listings should be displayed here.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-medium">Storefront URL</p>
                    <p className="break-all text-sm text-muted-foreground">
                      {window.location.origin}{publicStoreUrl}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="shrink-0 gap-2"
                    onClick={() =>
                      navigator.clipboard
                        .writeText(
                          `${window.location.origin}${publicStoreUrl}`,
                        )
                        .then(() => toast.success("Store link copied."))
                        .catch(() => toast.error("Could not copy the link."))
                    }
                  >
                    Copy link
                  </Button>
                </div>

                <Button
                  className="gap-2"
                  onClick={() => navigate(publicStoreUrl)}
                >
                  <ExternalLink className="h-4 w-4" />
                  Open storefront
                </Button>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">Your advertisements</h2>
                <p className="text-sm text-muted-foreground">
                  Listings linked to your seller account.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate("/marketplace")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Marketplace
              </Button>
            </div>

            {adsError ? (
              <Card>
                <CardContent className="p-5 text-sm text-muted-foreground">
                  Your advertisements could not be loaded.
                </CardContent>
              </Card>
            ) : adsLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : advertisements.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
                  <Package className="h-10 w-10 text-muted-foreground" />
                  <h3 className="font-semibold">Your store is ready</h3>
                  <p className="text-sm text-muted-foreground">
                    You have no advertisements linked to this account yet.
                  </p>
                  <Button onClick={() => navigate("/post-ad")}>
                    Create a listing
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {advertisements.map((ad, index) => {
                  const title = getListingTitle(ad);
                  const imageUrl = getListingImage(ad);
                  const price = getListingPrice(ad);
                  const publicListing = isPubliclyListed(ad);

                  return (
                    <Card
                      key={getListingId(ad, index)}
                      className="overflow-hidden"
                    >
                      <div className="aspect-[4/3] bg-muted">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={title}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <ImageIcon className="h-10 w-10 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>
                      <CardContent className="space-y-2 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <h3 className="font-semibold">{title}</h3>
                          <Badge variant={publicListing ? "secondary" : "outline"}>
                            {publicListing ? "Visible" : "Not public"}
                          </Badge>
                        </div>
                        {price && (
                          <p className="font-bold text-primary">{price}</p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Seller profile settings</CardTitle>
                <CardDescription>
                  Update the information displayed on your public storefront.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="mb-6 flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={avatarUrl} alt={name} />
                    <AvatarFallback className="bg-primary/10 text-xl text-primary">
                      {profileInitials || <User className="h-8 w-8" />}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-2">
                    <Label htmlFor="avatar-upload">Profile photo</Label>
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingAvatar}
                        onClick={() =>
                          document.getElementById("avatar-upload")?.click()
                        }
                        className="gap-2"
                      >
                        {uploadingAvatar ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Camera className="h-4 w-4" />
                        )}
                        {uploadingAvatar ? "Uploading..." : "Change photo"}
                      </Button>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                        disabled={uploadingAvatar}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Images only, up to 5 MB.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="seller-name">Full name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="seller-name"
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          placeholder="Your name or business name"
                          className="pl-9"
                          maxLength={100}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="seller-phone">Phone number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="seller-phone"
                          value={phone}
                          onChange={(event) => setPhone(event.target.value)}
                          placeholder="+268 7612 3456"
                          className="pl-9"
                          maxLength={20}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Use a number buyers can contact you on.
                      </p>
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="seller-location">Location</Label>
                      <Select
                        value={location}
                        onValueChange={setLocation}
                      >
                        <SelectTrigger id="seller-location">
                          <SelectValue placeholder="Select your main area" />
                        </SelectTrigger>
                        <SelectContent>
                          {LOCATIONS.map((loc) => (
                            <SelectItem key={loc} value={loc}>
                              {loc}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end border-t pt-4">
                    <Button
                      type="submit"
                      disabled={
                        updateProfileMutation.isPending ||
                        !hasChanges
                      }
                      className="min-w-36"
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save changes"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Account security</CardTitle>
                <CardDescription>
                  Review the account used to access Market Hub.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold">Sign-in email</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.email || "Not available"}
                    </p>
                  </div>
                  <Badge variant="outline">
                    Authentication account
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Password resets and email changes should use your existing
                  Supabase authentication flow.
                </p>
                <Button
                  variant="destructive"
                  className="gap-2"
                  onClick={() => signOut?.()}
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </main>
  );
};

export default ProfilePage;
