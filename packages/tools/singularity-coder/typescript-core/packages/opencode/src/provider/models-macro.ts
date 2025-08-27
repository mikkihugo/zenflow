export async function data() {
  return await fetch("https://models.dev/api.json").then((x) => x.text())
}
