document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar-container");
  const backdrop = sidebar.querySelector(".sidebarbackdrop");

  window.openSidebar = () => {
    sidebar.classList.add("open");
  };

  backdrop.addEventListener("click", () => {
    sidebar.classList.remove("open");
  });
});
