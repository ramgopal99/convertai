export const integrationCodes = {
  html: `<!-- Add this to your HTML file -->
<script>
    window.chatbotConfig = {
        domain: "http://localhost:3000",
        allowedDomain: "your-domain.com",
        theme: "light",
        position: "bottom-right"
    };
</script>
<script src="http://localhost:3000/widget.js"></script>`,

  react: `// Add this to your React component
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Configure chatbot
    window.chatbotConfig = {
      domain: "http://localhost:3000",
      allowedDomain: "your-domain.com",
      theme: "light",
      position: "bottom-right"
    };

    // Load chatbot script
    const script = document.createElement('script');
    script.src = "http://localhost:3000/widget.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <div>Your React App</div>;
}`,

  vue: `<!-- Add this to your Vue component -->
<template>
  <div>Your Vue App</div>
</template>

<script>
export default {
  name: 'App',
  mounted() {
    // Configure chatbot
    window.chatbotConfig = {
      domain: "http://localhost:3000",
      allowedDomain: "your-domain.com",
      theme: "light",
      position: "bottom-right"
    };

    // Load chatbot script
    const script = document.createElement('script');
    script.src = "http://localhost:3000/widget.js";
    script.async = true;
    document.body.appendChild(script);
  },
  beforeDestroy() {
    // Cleanup
    const script = document.querySelector('script[src="http://localhost:3000/widget.js"]');
    if (script) document.body.removeChild(script);
  }
}
</script>`,

  angular: `// Add this to your Angular component
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-root',
  template: '<div>Your Angular App</div>'
})
export class AppComponent implements OnInit, OnDestroy {
  ngOnInit() {
    // Configure chatbot
    (window as any).chatbotConfig = {
      domain: "http://localhost:3000",
      allowedDomain: "your-domain.com",
      theme: "light",
      position: "bottom-right"
    };

    // Load chatbot script
    const script = document.createElement('script');
    script.src = "http://localhost:3000/widget.js";
    script.async = true;
    document.body.appendChild(script);
  }

  ngOnDestroy() {
    // Cleanup
    const script = document.querySelector('script[src="http://localhost:3000/widget.js"]');
    if (script) document.body.removeChild(script);
  }
}`
} as const

export type Framework = keyof typeof integrationCodes