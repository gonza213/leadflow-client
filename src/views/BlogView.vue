<script setup>
import { useHead } from '@unhead/vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const { t, tm } = useI18n()
const router = useRouter()

useHead({
  title: () => t('blog.seoTitle') || t('blog.title'),
  meta: [
    { name: 'description', content: () => t('blog.seoDescription') || t('blog.subtitle') },
    { name: 'keywords', content: 'blog distribución leads, lead distribution, automatización ventas, CRM integración, gohighlevel, hubspot' },
    { property: 'og:title', content: () => t('blog.title') },
    { property: 'og:description', content: () => t('blog.subtitle') },
    { property: 'og:type', content: 'website' },
    { name: 'robots', content: 'index, follow' },
    { rel: 'canonical', href: 'https://www.leaddistro.site/blog' }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": "LeadDistro Blog",
        "description": t('blog.subtitle'),
        "url": "https://www.leaddistro.site/blog",
        "publisher": {
          "@type": "Organization",
          "name": "LeadDistro",
          "url": "https://www.leaddistro.site"
        }
      })
    }
  ]
})

const postsData = tm('blog.posts')

const posts = postsData ? Object.keys(postsData).map(key => ({
  slug: key,
  ...postsData[key],
  category: key === 'integraciones' || key === 'resumenes-ia' ? 'Funciones' : 'Estrategia'
})) : []

const getCardStyle = (slug) => {
  const styles = {
    'algoritmo': { 
      gradient: 'linear-gradient(135deg, #0f172a 0%, #3b82f6 100%)', 
      icon: '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>'
    },
    'periodo': { 
      gradient: 'linear-gradient(135deg, #1e293b 0%, #f43f5e 100%)', 
      icon: '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'
    },
    'integraciones': { 
      gradient: 'linear-gradient(135deg, #0f172a 0%, #22c55e 100%)', 
      icon: '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>'
    },
    'resumenes-ia': { 
      gradient: 'linear-gradient(135deg, #1e1b4b 0%, #8b5cf6 100%)', 
      icon: '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 12l8-4"/><circle cx="12" cy="12" r="10"/></svg>'
    },
    'gohighlevel': { 
      gradient: 'linear-gradient(135deg, #0f172a 0%, #22c55e 100%)', 
      icon: '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>'
    },
    'hubspot': { 
      gradient: 'linear-gradient(135deg, #1e293b 0%, #f97316 100%)', 
      icon: '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>'
    },
    'round-robin': { 
      gradient: 'linear-gradient(135deg, #0f172a 0%, #06b6d4 100%)', 
      icon: '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>'
    },
    'limites': { 
      gradient: 'linear-gradient(135deg, #1e293b 0%, #eab308 100%)', 
      icon: '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'
    }
  }
  return styles[slug] || { gradient: 'linear-gradient(135deg, #1e293b 0%, #6366f1 100%)', icon: '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' }
}
</script>

<template>
  <div class="blog-container">
    <header class="blog-header">
      <div class="container">
        <a href="/landing" class="back-link">← Volver a LeadDistro</a>
        <h1>{{ t('blog.title') }}</h1>
        <p>{{ t('blog.subtitle') }}</p>
      </div>
    </header>

    <main class="container">
      <div v-if="posts.length === 0" class="no-posts">
        <p>Cargando artículos...</p>
      </div>
      <div v-else class="blog-grid">
        <article 
          v-for="post in posts" 
          :key="post.slug"
          class="blog-card"
          @click="router.push(`/blog/${post.slug}`)"
        >
          <div class="card-image" :style="{ background: getCardStyle(post.slug).gradient }">
            <div class="card-icon" v-html="getCardStyle(post.slug).icon"></div>
            <span class="card-category">{{ post.category }}</span>
          </div>
          <div class="card-content">
            <h2>{{ post.title }}</h2>
            <p>{{ post.description }}</p>
            <span class="card-link">{{ t('blog.readMore') }} →</span>
          </div>
        </article>
      </div>
    </main>
  </div>
</template>

<style scoped>
.blog-container {
  min-height: 100vh;
  background: #0f172a;
  color: #e2e8f0;
  padding-top: 80px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.blog-header {
  text-align: center;
  padding: 60px 0 80px;
}

.blog-header h1 {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.blog-header p {
  font-size: 1.25rem;
  color: #94a3b8;
}

.back-link {
  display: inline-block;
  color: #3b82f6;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 24px;
  text-decoration: none;
  transition: color 0.2s;
}

.back-link:hover {
  color: #60a5fa;
}

.blog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 32px;
  padding-bottom: 80px;
}

.blog-card {
  background: #1e293b;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.blog-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.card-image {
  height: 180px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-icon :deep(svg) {
  width: 56px;
  height: 56px;
  opacity: 0.85;
}

.card-category {
  position: absolute;
  top: 16px;
  left: 16px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.card-content {
  padding: 24px;
}

.card-content h2 {
  font-size: 1.25rem;
  margin-bottom: 12px;
  color: white;
  line-height: 1.4;
}

.card-content p {
  color: #94a3b8;
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 16px;
}

.card-link {
  color: #3b82f6;
  font-weight: 600;
  font-size: 0.9rem;
}
</style>