import residential from '@/assets/hero-residential.jpg';
import commercial from '@/assets/hero-commercial.jpg';
import villa from '@/assets/hero-villa.jpg';
import plots from '@/assets/plots.jpg';
import interior from '@/assets/interior.jpg';
import villas from '@/assets/villas.jpg';
import retail from '@/assets/retail.jpg';
import residentialAsset from '@/assets/hero-residential.jpg.asset.json';
import commercialAsset from '@/assets/hero-commercial.jpg.asset.json';
import villaAsset from '@/assets/hero-villa.jpg.asset.json';
import plotsAsset from '@/assets/plots.jpg.asset.json';
import interiorAsset from '@/assets/interior.jpg.asset.json';
import villasAsset from '@/assets/villas.jpg.asset.json';
import retailAsset from '@/assets/retail.jpg.asset.json';

const images = new Map([
  [residentialAsset.url, residential], [commercialAsset.url, commercial],
  [villaAsset.url, villa], [plotsAsset.url, plots], [interiorAsset.url, interior],
  [villasAsset.url, villas], [retailAsset.url, retail],
]);

export function resolvePropertyImage(source: string) {
  return images.get(source) ?? source;
}