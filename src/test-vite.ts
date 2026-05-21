import { createServer } from "vite";
console.log("IMPORTED VITE");
async function main() {
  try {
    const server = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    console.log("VITE SERVER CREATED SUCCESSFULLY");
  } catch (err: any) {
    console.error("ERROR CREATING VITE SERVER:", err.message);
  }
}
main();
