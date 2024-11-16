import * as fs from "fs";

export class PersistentMap {
  private map: Map<string, string>;
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
    this.map = new Map<string, string>();

    // Load existing data from the JSON file if it exists
    this.loadFromFile();
  }

  private loadFromFile(): void {
    if (fs.existsSync(this.filePath)) {
      const fileContent = fs.readFileSync(this.filePath, "utf-8");
      const data = JSON.parse(fileContent);
      this.map = new Map(Object.entries(data));
    }
  }

  private saveToFile(): void {
    const jsonObject = Object.fromEntries(this.map);
    fs.writeFileSync(
      this.filePath,
      JSON.stringify(jsonObject, null, 2),
      "utf-8"
    );
  }

  public set(key: string, value: string): void {
    this.map.set(key, value);
    this.saveToFile();
  }

  public get(key: string): string | undefined {
    return this.map.get(key);
  }

  public has(key: string): boolean {
    return this.map.has(key);
  }

  public delete(key: string): boolean {
    const result = this.map.delete(key);
    this.saveToFile();
    return result;
  }

  public clear(): void {
    this.map.clear();
    this.saveToFile();
  }

  public keys(): IterableIterator<string> {
    return this.map.keys();
  }

  public values(): IterableIterator<string> {
    return this.map.values();
  }

  public entries(): IterableIterator<[string, string]> {
    return this.map.entries();
  }

  public size(): number {
    return this.map.size;
  }
}
