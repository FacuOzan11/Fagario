export const THEME_STORAGE_KEY = "tope-theme";

/** Aplica la clase de tema antes del primer paint (evita el flash). Va en <head>. */
const code = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");var c=document.documentElement.classList;c.remove("dark","light");if(t==="dark"||t==="light")c.add(t);}catch(e){}})();`;

export function ThemeScript() {
  return <script id="tope-theme-script" dangerouslySetInnerHTML={{ __html: code }} />;
}
