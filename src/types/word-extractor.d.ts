declare module "word-extractor" {
  interface ExtractedDocument {
    getBody(): string;
    getHeaders?(options?: { includeFooters?: boolean }): string;
    getFooters?(): string;
    getTextboxes?(options?: { includeHeadersAndFooters?: boolean; includeBody?: boolean }): string;
  }
  export default class WordExtractor {
    extract(source: string | Buffer): Promise<ExtractedDocument>;
  }
}
