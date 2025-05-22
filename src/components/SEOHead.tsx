import { Meta, Title, Link } from "@solidjs/meta";
import { Component } from "solid-js";

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  noindex?: boolean;
}

/**
 * Reusable SEO component for consistent metadata across pages
 */
const SEOHead: Component<SEOHeadProps> = (props) => {
  const defaultTitle = "Pro-L00ps | Music Practice Tool";
  const defaultDescription = 
    "Create, save, and practice custom YouTube video loops. Perfect for musicians learning difficult passages.";
  const baseUrl = "https://pro-loops.com";
  
  return (
    <>
      <Title>{props.title || defaultTitle}</Title>
      <Meta name="description" content={props.description || defaultDescription} />
      
      {/* OpenGraph / Facebook */}
      <Meta property="og:type" content={props.ogType || "website"} />
      <Meta property="og:title" content={props.title || defaultTitle} />
      <Meta property="og:description" content={props.description || defaultDescription} />
      <Meta property="og:image" content={props.ogImage || `${baseUrl}/images/og-image.jpg`} />
      <Meta property="og:url" content={props.canonicalUrl || baseUrl} />
      
      {/* Twitter */}
      <Meta name="twitter:card" content={props.twitterCard || "summary_large_image"} />
      <Meta name="twitter:title" content={props.title || defaultTitle} />
      <Meta name="twitter:description" content={props.description || defaultDescription} />
      <Meta name="twitter:image" content={props.ogImage || `${baseUrl}/images/og-image.jpg`} />
      
      {/* Canonical URL */}
      <Link rel="canonical" href={props.canonicalUrl || baseUrl} />
      
      {/* Favicon */}
      <Link rel="icon" href="/favicon.ico" />
      <Link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      
      {/* No index if specified */}
      {props.noindex && <Meta name="robots" content="noindex" />}
    </>
  );
};

export default SEOHead;
