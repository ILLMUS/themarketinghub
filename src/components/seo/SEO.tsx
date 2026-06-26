import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  noIndex?: boolean;

  // Marketplace/Product SEO
  price?: number;
  currency?: string;
  availability?: "InStock" | "OutOfStock";
}

const SITE_NAME = "The Market Hub";
const SITE_URL = "https://themarkethubsz.com"; // Replace with your real domain
const DEFAULT_IMAGE = `${SITE_URL}/logo.png`;

export default function SEO({
  title,
  description,
  keywords,
  image,
  url,
  type = "website",
  noIndex = false,
  price,
  currency = "SZL",
  availability = "InStock",
}: SEOProps) {
  const pageTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} | Buy & Sell Across Eswatini`;

  const pageDescription =
    description ??
    "The Market Hub is Eswatini's online marketplace where you can buy and sell vehicles, electronics, real estate, jobs, construction materials, livestock, services and much more.";

  const pageKeywords =
    keywords ??
    `
Eswatini marketplace,
Buy and sell Eswatini,
Online classifieds,
Vehicles,
Cars,
Property,
Real Estate,
Construction,
Jobs,
Furniture,
Electronics,
Mobile Phones,
Agriculture,
Livestock,
Fashion,
Perfumes,
Health and Beauty,
Services,
Entertainment,
Loans,
Marketplace Eswatini
`;

  const canonicalUrl = url
    ? `${SITE_URL}${url}`
    : SITE_URL;

  const pageImage = image ?? DEFAULT_IMAGE;

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: DEFAULT_IMAGE,
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
  };

  const productSchema =
    type === "article" && title
      ? {
          "@context": "https://schema.org",
          "@type": "Product",
          name: title,
          image: pageImage,
          description: pageDescription,
          offers: {
            "@type": "Offer",
            price,
            priceCurrency: currency,
            availability: `https://schema.org/${availability}`,
            url: canonicalUrl,
          },
        }
      : null;

  return (
    <Helmet>

      {/* Basic SEO */}

      <title>{pageTitle}</title>

      <meta
        name="description"
        content={pageDescription}
      />

      <meta
        name="keywords"
        content={pageKeywords}
      />

      <meta
        name="robots"
        content={noIndex ? "noindex,nofollow" : "index,follow"}
      />

      <link
        rel="canonical"
        href={canonicalUrl}
      />

      {/* Open Graph */}

      <meta property="og:type" content={type} />

      <meta
        property="og:site_name"
        content={SITE_NAME}
      />

      <meta
        property="og:title"
        content={pageTitle}
      />

      <meta
        property="og:description"
        content={pageDescription}
      />

      <meta
        property="og:image"
        content={pageImage}
      />

      <meta
        property="og:url"
        content={canonicalUrl}
      />

      {/* Twitter */}

      <meta
        name="twitter:card"
        content="summary_large_image"
      />

      <meta
        name="twitter:title"
        content={pageTitle}
      />

      <meta
        name="twitter:description"
        content={pageDescription}
      />

      <meta
        name="twitter:image"
        content={pageImage}
      />

      {/* JSON-LD */}

      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>

      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>

      {productSchema && (
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
      )}
    </Helmet>
  );
}