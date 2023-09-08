import { getPlaiceholder } from "plaiceholder";
import fs from "fs";
import util from "util";
import path from "path";

const __dirname = path.resolve();
const uploadDir = path.join(__dirname, "uploads");

async function base64() {
  const file = fs.readFileSync(
    `${uploadDir}/dusan-veverkolog-edrW8VIlJJg-unsplash.jpg`
  );
  console.log("file", file);
  const { base64 } = await getPlaiceholder(file);

  console.log("base64", base64);
}

base64();
