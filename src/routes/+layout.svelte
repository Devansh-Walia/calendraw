<script>
    import Header from './Header.svelte';
    import './styles.css';
</script>

<div class="app">
    <Header />

    <main class="patrick-hand">
        <slot />
    </main>

    <footer>
        <p>
            Visit <a
                href="https://github.com/Devansh-Walia/calendraw"
                target="_blank"
                rel="noopener noreferrer">this GitHub repo</a
            > to learn more
        </p>
        <p>
            Created by <a
                href="https://devanshwalia.com"
                target="_blank"
                rel="noopener noreferrer">Devansh Walia</a
            >
        </p>
    </footer>
</div>

<style>
    .app {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    }

    main {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 1rem;
        width: 100%;
        max-width: 64rem;
        margin: 0 auto;
        box-sizing: border-box;
    }

    footer {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 12px;
    }

    footer a {
        font-weight: bold;
    }

    @media (min-width: 480px) {
        footer {
            padding: 12px 0;
        }
    }
</style>
