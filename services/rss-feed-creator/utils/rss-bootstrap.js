// services/rss-feed-creator/utils/rss-bootstrap.js
import { ENV } from "../../../scripts/envBootstrap.js";

/*
  Centralised RSS bootstrap using canonical ENV contract.
*/

export function getRssBucket() {
  return ENV.r2.buckets.rss;
}
