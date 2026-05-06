export function ThemeScript() {
  const code = `(function(){try{var t=localStorage.getItem('theme');var d=document.documentElement;d.classList.remove('light','dark');if(t==='light'||t==='dark'){d.classList.add(t);}else{d.classList.add('dark');}}catch(e){}})();`;

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}

