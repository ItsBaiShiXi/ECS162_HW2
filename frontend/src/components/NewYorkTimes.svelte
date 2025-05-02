<script lang="ts">
  import { onMount } from "svelte";
  import "../styles/Homepage.css";

  let formattedDate = "";
  let articles: any[] = [];
  let API_KEY = "";

  /* Filter out news from the Davis/Sacramento area */
  const FILTER = 'timesTag.location:("Davis","Sacramento")';

  onMount(async () => {
    /* The date function from HW1 */
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    formattedDate = today.toLocaleDateString("en-US", options);

    /* await the API Key and Articles */
    await fetchAPIKey();
    await fetchArticles();
  });

  /* fetch function
  fetch the API Key from backend
  */
  async function fetchAPIKey() {
    try {
      const response = await fetch("/api/key");
      const data = await response.json();
      API_KEY = data.apiKey;
    } catch (error) {
      console.error("Failed to fetch API key:", error);
    }
  }
  /* fetch function
  fetch the articles from The New York Time withe FILTER and API key
  */
  async function fetchArticles() {
    try {
      const response = await fetch(
        `https://api.nytimes.com/svc/search/v2/articlesearch.json?fq=${encodeURIComponent(FILTER)}&sort=newest&api-key=${API_KEY}`
      );
      const data = await response.json();
      articles = data.response.docs;
    } catch (error) {
      console.error("Failed to fetch NYT articles:", error);
    }
  }
</script>

<!-- The header from HW1 -->
<header>
  <div class="header-container">
    <div class="date">
      <b>{formattedDate}</b><br />
      Today's Paper
    </div>
    <h1 class="title">
      <img
        src="TheNewYorkTimes.jpg"
        alt="The New York Times"
        class="title-image"
      />
    </h1>
  </div>
</header>

<!-- The main from HW1 -->
<main>
  <section class="grid-container">
    <!-- Show the first 6 article in the article array -->
    {#each articles.slice(0, 6) as article (article._id)}
      <article class="article">
        <!-- Shows an image if the article has a multimedia URL -->
        {#if article.multimedia?.default?.url}
          <img
            class="article-image"
            src={"https://www.nytimes.com/" + article.multimedia.default.url}
            alt={article.headline?.main || "News image"}
          />
        {/if}
        <!-- Displays the article's headline or Untitled Article  -->
        <h2>{article.headline?.main || "Untitled Article"}</h2>
        <p class="article-text">
          {article.abstract || article.snippet || "No summary available."}
        </p>

        <!-- display article link -->
        {#if article.web_url}
          <a href={article.web_url} target="_blank" rel="noopener noreferrer"
            >Origin Article</a
          >
        {/if}
      </article>
    {/each}
  </section>
</main>

<footer>
  <div class="footer-container"></div>
</footer>
