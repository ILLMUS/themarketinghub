import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, ArrowLeft, MessageCircle } from "lucide-react";
import { format } from "date-fns";

const MessagesPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeConvoId = searchParams.get("conversation");
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  // Fetch conversations
  const { data: conversations, isLoading: convosLoading } = useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*, advertisements(title, images), buyer:profiles!conversations_buyer_id_fkey(name), seller:profiles!conversations_seller_id_fkey(name)")
        .or(`buyer_id.eq.${user!.id},seller_id.eq.${user!.id}`)
        .order("updated_at", { ascending: false });
      if (error) {
        // Fallback without joins if foreign key names differ
        const { data: fallback, error: err2 } = await supabase
          .from("conversations")
          .select("*, advertisements(title, images)")
          .or(`buyer_id.eq.${user!.id},seller_id.eq.${user!.id}`)
          .order("updated_at", { ascending: false });
        if (err2) throw err2;
        return fallback;
      }
      return data;
    },
    enabled: !!user,
  });

  // Fetch messages for active conversation
  const { data: messages } = useQuery({
    queryKey: ["messages", activeConvoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", activeConvoId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!activeConvoId,
  });

  // Realtime subscription
  useEffect(() => {
    if (!activeConvoId) return;
    const channel = supabase
      .channel(`messages-${activeConvoId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${activeConvoId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["messages", activeConvoId] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeConvoId, queryClient]);

  const sendMessage = useMutation({
    mutationFn: async () => {
      if (!newMessage.trim() || !activeConvoId || !user) return;
      const { error } = await supabase.from("messages").insert({
        conversation_id: activeConvoId,
        sender_id: user.id,
        content: newMessage.trim(),
      });
      if (error) throw error;
      // Update conversation timestamp
      await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", activeConvoId);
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["messages", activeConvoId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  if (authLoading || convosLoading) {
    return <div className="container py-20 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>;
  }

  const activeConvo = conversations?.find((c) => c.id === activeConvoId);

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      <div className="grid md:grid-cols-3 gap-6 min-h-[60vh]">
        {/* Conversation list */}
        <div className="md:col-span-1 border rounded-lg overflow-hidden">
          <div className="p-3 border-b bg-muted/50 font-semibold text-sm">Inbox</div>
          <div className="divide-y max-h-[60vh] overflow-y-auto">
            {!conversations?.length ? (
              <div className="p-6 text-center text-muted-foreground text-sm">No conversations yet</div>
            ) : conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => navigate(`/messages?conversation=${c.id}`)}
                className={`w-full text-left p-3 hover:bg-muted/50 transition-colors ${activeConvoId === c.id ? "bg-muted" : ""}`}
              >
                <p className="font-medium text-sm line-clamp-1">{(c as any).advertisements?.title ?? "Listing"}</p>
                <p className="text-xs text-muted-foreground">{format(new Date(c.updated_at), "MMM d, h:mm a")}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="md:col-span-2 border rounded-lg flex flex-col">
          {activeConvoId && activeConvo ? (
            <>
              <div className="p-3 border-b bg-muted/50 flex items-center gap-2">
                <Button variant="ghost" size="sm" className="md:hidden" onClick={() => navigate("/messages")}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <p className="font-semibold text-sm line-clamp-1">{(activeConvo as any).advertisements?.title ?? "Chat"}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[50vh]">
                {messages?.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${msg.sender_id === user?.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      <p>{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.sender_id === user?.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {format(new Date(msg.created_at), "h:mm a")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <form
                onSubmit={(e) => { e.preventDefault(); sendMessage.mutate(); }}
                className="p-3 border-t flex gap-2"
              >
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button type="submit" size="sm" disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
