import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

interface SearchResult {
  title: string;
  snippet: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const profession = searchParams.get("profession");
  const location = searchParams.get("location");
  const pageNumber = parseInt(searchParams.get("page") || "1");

  if (!profession || !location) {
    return NextResponse.json({ error: "Both profession and location are required" }, { status: 400 });
  }

  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  try {
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

    // Define searchQueries array
    const searchQueries = [
      `site:instagram.com "${profession}" "${location}" "@gmail.com"`,
      `site:linkedin.com "${profession}" "${location}" "@gmail.com"`
    ];

    let allResults: SearchResult[] = [];
    let currentPage = pageNumber;
    const maxAttempts = 3;
    let attempts = 0;

    while (allResults.length < 10 && attempts < maxAttempts) {
      const firstResult = (currentPage - 1) * 10 + 1;

      for (const query of searchQueries) {
        await page.goto(`https://www.bing.com/search?q=${encodeURIComponent(query)}&first=${firstResult}`, {
          waitUntil: "networkidle0",
          timeout: 60000,
        });

        await page.waitForSelector(".b_algo", { timeout: 60000 });

        const results: SearchResult[] = await page.evaluate(() => {
          const searchResults = Array.from(document.querySelectorAll(".b_algo"));
          return searchResults.map((result) => {
            const titleElement = result.querySelector("h2");
            const snippetElement = result.querySelector(".b_caption p");
            return {
              title: titleElement?.innerText || "No title",
              snippet: snippetElement?.textContent || "",
            };
          }).filter(item => item.title !== "No title");
        });

        // Filter results that contain either email or phone number
        const validResults = results.filter(item => {
          const hasEmail = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/.test(item.snippet);
          const hasPhone = /(?:\+\d{1,3}[-. ]?)?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}/.test(item.snippet);
          return hasEmail || hasPhone;
        });

        allResults = [...allResults, ...validResults];
      }

      currentPage++;
      attempts++;
    }

    await browser.close();
    return NextResponse.json(allResults);

  } catch (error) {
    console.error("Error during scraping:", error);
    await browser.close();
    return NextResponse.json({ error: `Failed to fetch search results: ${error}` }, { status: 500 });
  }
}
