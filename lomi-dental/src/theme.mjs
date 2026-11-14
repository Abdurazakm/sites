export function applyTheme(root, dark) {
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
}

export const themeInitScript = `try{(${applyTheme.toString()})(document.documentElement,localStorage.getItem("lomi-theme")==="dark");}catch{document.documentElement.style.colorScheme="light";}`;
