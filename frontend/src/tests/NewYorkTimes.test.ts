import { test, vi, expect } from 'vitest';
import { render, waitFor, screen } from '@testing-library/svelte';
import NewYorkTimes from '../components/NewYorkTimes.svelte';

// API key can't directly accessing in the test unless I break the encapsulation
// So mock the fetch, see if the result works as expect
test('Check Fetch', async () => {
    const testKey = 'qwq';

    // Setup mock for fetch
    const fetchMock = vi.fn()
        // await fetchAPIKey(); 
        .mockResolvedValueOnce({
            json: () => Promise.resolve({ apiKey: testKey }),
        })

        //await fetchArticles();
        .mockResolvedValueOnce({
            json: () => Promise.resolve({
                response: {
                    docs: [
                        {
                            _id: "nyt://article/abc",
                            headline: { main: "Test Headline" },
                            abstract: "Test Abstract",
                            multimedia: { default: { url: "test-image.jpg" } },
                            web_url: "https://example.com/article",
                        },
                    ],
                },
            }),
        });

    // use fetchMock replace the global fetch function
    // any call to fetch() will now use fetchMock
    vi.stubGlobal('fetch', fetchMock);

    render(NewYorkTimes);

    // Wait for article to appear in the DOM
    await waitFor(() => {
        expect(screen.getByText("Test Headline")).toBeInTheDocument();
        expect(screen.getByText("Test Abstract")).toBeInTheDocument();
        expect(screen.getByText("Origin Article")).toHaveAttribute('href', 'https://example.com/article');
        expect(screen.getByAltText("Test Headline")).toHaveAttribute('src', 'https://www.nytimes.com/test-image.jpg');
    });

    // Verifies called backend for api key
    expect(fetchMock).toHaveBeenCalledWith('/api/key');
    // Verifies API key worked as expect
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining(`api-key=${testKey}`));
    // Verifies NYT query includes Davis or Sacramento
    expect(
        fetchMock.mock.calls.some(call => call[0].includes("Davis") || call[0].includes("Sacramento"))
    ).toBe(true);
});

// Simply check if the date matches the format with regex
test('Check date format', async () => {
    // Add a minimal fetch mock to Check date format
    vi.stubGlobal('fetch', vi.fn()
        .mockResolvedValue({
            json: () => Promise.resolve({ apiKey: 'test-key' }), 
        })
    );

    render(NewYorkTimes);

    await waitFor(() => {
        const dateRegex = /\w+day, \w+ \d{1,2}, \d{4}/;
        const dateElement = screen.getByText(dateRegex);
        expect(dateElement).toBeInTheDocument();
    });
});
