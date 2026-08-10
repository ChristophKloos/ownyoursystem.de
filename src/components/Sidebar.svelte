<script lang="ts">
    export let isOpen = false;
    let isGroupActive = false;

    function closeSidebar() {
        isOpen = false;
    }

    function toggleGroup() {
        isGroupActive = !isGroupActive;
    }
</script>

<div id="sidebar-container" class="sidebar-container" class:open={isOpen}>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="sidebarbackdrop" on:click={closeSidebar}></div>
    
    <div class="sidebarwrapper">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <h4  on:click={toggleGroup}>Helpful Links</h4>
        
        <div class="nav-group" class:active={isGroupActive}>
            <a href="https://distro.ownyoursystem.de" class="sidebaritem">
                <img alt="Distro Picker Icon" src="/ui/sidebar/picker.svg" />
                <div class="item-text">
                    <span class="title">Distro Picker</span>
                    <span class="desc">Find the right Linux system</span>
                </div>
            </a>

            <a href="https://flathub.org/" class="sidebaritem">
                <img alt="flathub" src="/ui/sidebar/10.svg" />
                <div class="item-text">
                    <span class="title">Flathub</span>
                    <span class="desc">Universal app store for any distro</span>
                </div>
            </a>

            <a href="https://www.protondb.com/" class="sidebaritem">
                <img alt="Proton" src="/ui/sidebar/proton.svg" />
                <div class="item-text">
                    <span class="title">ProtonDB</span>
                    <span class="desc">Check if your games run on Linux</span>
                </div>
            </a>
            
            <a href="https://opensourcealternative.to" class="sidebaritem">
                <img alt="Apps Icon" src="/ui/sidebar/open.svg" />
                <div class="item-text">
                    <span class="title">Open Source Alternative</span>
                    <span class="desc">FOSS replacements for popular apps</span>
                </div>
            </a>
            
            <a href="https://endof10.org/" class="sidebaritem">
                <img alt="endof10" src="/ui/sidebar/windows.svg" />
                <div class="item-text">
                    <span class="title">End Of 10</span>
                    <span class="desc">Windows 10 end of support info</span>
                </div>
            </a>
            
            <a href="https://distrowatch.com/" class="sidebaritem">
                <img alt="distrowatch" src="/ui/sidebar/dwatch.svg" />
                <div class="item-text">
                    <span class="title">Distrowatch</span>
                    <span class="desc">Database of all Linux distributions</span>
                </div>
            </a>
        </div>

        <a href="/about" class="sidebaritem bottom dark">
            <div class="item-text">
                <span class="title"><img alt="info" src="/ui/info.svg" />About this site</span>
                <span class="desc">Distro Picker v2.0 - Beta</span>
            </div>
        </a>
    </div>
</div>

<style>
    .sidebar-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 320px;
    height: 100vh;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 1000;
    outline: var(--outline-weak);
}

.sidebar-container.open {
    transform: translateX(0);
}

.sidebarbackdrop {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 500vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0);
    z-index: 900;
    transition: background-color 0.5s ease;
}

.sidebar-container.open .sidebarbackdrop {
    display: block;
    background-color: rgba(0, 0, 0, 0.2);
}

.sidebarwrapper {
    position: relative;
    width: 320px;
    height: 100%;
    background-color: var(--bg-translucent);
    backdrop-filter: blur(20px);
    padding: 0.1px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
}

h4 {
    display: block;
    font-weight: var(--text-weight-fat);
    text-align: center;
    font-size: var(--font-md);
    margin: 35px 0 25px 0;
    color: var(--text-dark);
}

.nav-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 2px 12px 12px 12px;
    flex-grow: 1;
    overflow-y: auto;
}

.sidebaritem {
    display: flex;
    align-items: center;
    gap: 16px;
    box-sizing: border-box;
    background-color: transparent;
    border-radius: var(--radius-md);
    padding: 12px 16px;
    text-decoration: none;
    transition: background-color 0.2s ease;
}

.sidebaritem:hover {
    
    outline: var(--outline-weak);

      background-color: rgba(22, 22, 22, 0.05);
}

.sidebaritem img {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
}

.dark{
    background-color: rgba(22, 22, 22, 0.05);
    outline: var(--outline-weak);
}

.dark:hover{
    background: rgba(22, 22, 22, 0.02);
      outline: var(--outline-weak);
    box-shadow: none;
}

.item-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.item-text .title {
    color: var(--text-dark);
    font-size: var(--font-sm);
    font-weight: var(--text-weight-normal);
    line-height: 1.1;
}

.item-text .desc {
    color: var(--text-muted);
    font-size: var(--font-xs);
    line-height: 1.2;
    opacity: 0.8;
}

.bottom {
    margin: 12px;
    margin-top: auto;
}


.item-text .title {
    color: var(--text-dark);
    font-size: var(--font-sm);
    font-weight: var(--text-weight-normal);
    line-height: 1.1;
    display: flex;
    align-items: center;
    gap: 6px;
}

.item-text .title img {
    width: 16px;
    height: 16px;
}

h4{
    font-weight: var(--text-weight-normal);
    margin-top: 40px;
}
</style>