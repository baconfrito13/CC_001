import { config, type SiteConfig } from "@/config/site";

/**
 * The online withdrawal function (footer link, /<locale>/withdraw page, POST /api/withdrawal)
 * exists only for businesses that sell to consumers.
 */
export function withdrawalEnabled(
  siteConfig: Pick<SiteConfig, "legal"> = config,
): boolean {
  return siteConfig.legal.sellsToConsumers;
}
