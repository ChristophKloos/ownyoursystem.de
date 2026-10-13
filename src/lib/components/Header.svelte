<script lang="ts">
	interface Props {
		onOpenSidebar?: () => void;
	}

	let { onOpenSidebar }: Props = $props();
</script>

<header class="header">
	<button
		type="button"
		class="sidebar-toggle"
		onclick={() => onOpenSidebar?.()}
		aria-label="Open menu"
	>
		<img alt="" src="/ui/open-menu-symbolic.svg" />
	</button>
	<img alt="Home" id="logo" src="/ui/logo-small.webp" />

	<a
		class="github-pill"
		href="https://github.com/ChristophKloos/ownyoursystem.de"
		target="_blank"
		rel="noreferrer"
	>
		<span class="status-dot"></span> now on github
	</a>
</header>

<style>
	.header {
		position: fixed;
		top: 0;
		width: 100%;
		height: 64px;
		padding: 14px 32px;
		background-color: var(--bg-translucent);
		backdrop-filter: blur(10px);
		z-index: 5;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 16px;
	}

	.header img {
		height: 32px;
		width: auto;
	}

	.sidebar-toggle {
		position: absolute;
		left: 20px;
		height: 42px;
		width: 42px;
		padding: 13px;
		box-sizing: border-box;
		background: none;
		border: none;
		cursor: pointer;
		z-index: 50;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.sidebar-toggle img {
		height: 16px;
		width: 16px;
	}

	#logo {
		cursor: pointer;
	}

	.github-pill {
		position: absolute;
		top: 50%;
		right: 20px;
		transform: translateY(-50%);
		display: inline-flex;
		align-items: center;
		gap: 8px;
		background-color: var(--bg-alt);
		color: var(--text-muted);
		text-decoration: none;
		padding: 6px 14px;
		border-radius: 50px;
		font-size: 13px;
		font-weight: var(--text-weight-normal);
		border: var(--outline-weak);
		transition: var(--transition-snappy);
	}

	.github-pill:hover {
		color: var(--text-dark);
		box-shadow: var(--shadow-hard);
	}

	.status-dot {
		width: 8px;
		height: 8px;
		background-color: #23d160;
		border-radius: 50%;
		box-shadow: 0 0 8px rgba(35, 209, 96, 0.6);
	}
</style>
