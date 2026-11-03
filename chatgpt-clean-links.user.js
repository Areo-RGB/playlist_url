// ==UserScript==
// @name         ChatGPT Clean Links (remove ChatGPT UTM source)
// @namespace    https://github.com/Areo-RGB/playlist_url
// @version      1.0.0
// @description  Remove utm_source=chatgpt.com from links shown in ChatGPT, preserving other query parameters.
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  function cleanUrl(value) {
    try {
      const url = new URL(value, document.baseURI);
      if (url.searchParams.get('utm_source') !== 'chatgpt.com') return value;
      url.searchParams.delete('utm_source');
      return url.href;
    } catch {
      return value;
    }
  }

  function cleanLink(link) {
    const original = link.getAttribute('href');
    if (!original) return;
    const cleaned = cleanUrl(original);
    if (cleaned !== original) link.setAttribute('href', cleaned);
  }

  function scan(root) {
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
    if (root.matches?.('a[href]')) cleanLink(root);
    root.querySelectorAll?.('a[href]').forEach(cleanLink);
  }

  function start() {
    scan(document);
    const observer = new MutationObserver((changes) => {
      for (const change of changes) {
        if (change.type === 'attributes') {
          cleanLink(change.target);
        } else {
          change.addedNodes.forEach(scan);
        }
      }
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['href']
    });
    // Clean even if a page script rewrites href immediately before navigation.
    document.addEventListener('click', (event) => {
      const link = event.target.closest?.('a[href]');
      if (link) cleanLink(link);
    }, true);
  }

  if (document.documentElement) start();
  else document.addEventListener('DOMContentLoaded', start, { once: true });
})();
