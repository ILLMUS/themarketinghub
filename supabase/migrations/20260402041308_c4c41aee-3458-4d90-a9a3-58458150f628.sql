
-- Saved Ads table
CREATE TABLE public.saved_ads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  ad_id UUID NOT NULL REFERENCES public.advertisements(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, ad_id)
);

ALTER TABLE public.saved_ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved ads"
  ON public.saved_ads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save ads"
  ON public.saved_ads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave ads"
  ON public.saved_ads FOR DELETE
  USING (auth.uid() = user_id);

-- Conversations table
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id UUID NOT NULL REFERENCES public.advertisements(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(ad_id, buyer_id)
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Buyers can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Participants can update conversations"
  ON public.conversations FOR UPDATE
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
      AND (auth.uid() = c.buyer_id OR auth.uid() = c.seller_id)
    )
  );

CREATE POLICY "Participants can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
      AND (auth.uid() = c.buyer_id OR auth.uid() = c.seller_id)
    )
  );

CREATE POLICY "Recipient can mark messages as read"
  ON public.messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
      AND (auth.uid() = c.buyer_id OR auth.uid() = c.seller_id)
    )
  );

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

-- Add expires_at to advertisements
ALTER TABLE public.advertisements
  ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 days');

-- Update existing ads to have an expiry date
UPDATE public.advertisements
  SET expires_at = created_at + interval '30 days'
  WHERE expires_at IS NULL;

-- Create trigger for conversations updated_at
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
