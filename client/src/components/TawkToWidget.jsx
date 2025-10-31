import { useEffect } from "react";

const TawkToWidget = () => {
  useEffect(() => {
    var s1 = document.createElement("script");
    s1.async = true;
    s1.src = 'https://embed.tawk.to/69018c8c694e54194da176a4/1j8n1n55i';
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");
    document.body.appendChild(s1);

    return () => {
      // hapus script saat user pindah halaman
      const tawkScript = document.querySelector('script[src*="tawk.to"]');
      if (tawkScript) tawkScript.remove();
      const tawkWidget = document.getElementById('tawkto-widget');
      if (tawkWidget) tawkWidget.remove();
    };
  }, []);

  return null;
};

export default TawkToWidget;
