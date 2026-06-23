import { useEffect } from "react";
import defaultOgImage from "@/assets/og-image.jpg";

interface SeoOptions {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  jsonLd?: Record<string, any> | Record<string, any>[];
}

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
  return el;
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
  return el;
}

export function useSeo({ title, description, image, url, type = "website", jsonLd }: SeoOptions) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title.length > 60 ? title.slice(0, 57) + "..." : title;

    const canonical = url || window.location.href;
    const desc = (description || "").slice(0, 160);
    const absoluteImage = image
      ? (image.startsWith("http") ? image : `${window.location.origin}${image}`)
      : `${window.location.origin}${defaultOgImage}`;

    const created: Element[] = [];
    const track = (el: Element) => created.push(el);

    if (desc) track(upsertMeta("name", "description", desc));
    track(upsertMeta("property", "og:title", title));
    if (desc) track(upsertMeta("property", "og:description", desc));
    track(upsertMeta("property", "og:type", type));
    track(upsertMeta("property", "og:url", canonical));
    track(upsertMeta("property", "og:image", absoluteImage));
    track(upsertMeta("property", "og:image:width", "1200"));
    track(upsertMeta("property", "og:image:height", "1200"));
    track(upsertMeta("name", "twitter:card", "summary_large_image"));
    track(upsertMeta("name", "twitter:title", title));
    if (desc) track(upsertMeta("name", "twitter:description", desc));
    track(upsertMeta("name", "twitter:image", absoluteImage));
    track(upsertLink("canonical", canonical));

    let scriptEl: HTMLScriptElement | null = null;
    if (jsonLd) {
      scriptEl = document.createElement("script");
      scriptEl.type = "application/ld+json";
      scriptEl.text = JSON.stringify(jsonLd);
      document.head.appendChild(scriptEl);
    }

    return () => {
      document.title = prevTitle;
      if (scriptEl) scriptEl.remove();
    };
  }, [title, description, image, url, type, JSON.stringify(jsonLd)]);
}

export function Seo(props: SeoOptions) {
  useSeo(props);
  return null;
}