<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useHead } from '@unhead/vue'

const route = useRoute()
const router = useRouter()
const { t, tm } = useI18n()

const slug = computed(() => route.params.slug)

const postsData = tm('blog.posts')

const post = computed(() => {
  if (!slug.value || !postsData) return null
  return postsData[slug.value]
})

const formattedContent = computed(() => {
  if (!post.value?.content) return ''
  
  const content = post.value.content
  const lines = content.split('\n')
  let inList = false
  let result = []
  
  for (let line of lines) {
    line = line.trim()
    
    if (line.startsWith('## ')) {
      if (inList) { result.push('</ul>'); inList = false }
      result.push(`<h2>${line.replace('## ', '')}</h2>`)
    } 
    else if (line.startsWith('### ')) {
      if (inList) { result.push('</ul>'); inList = false }
      result.push(`<h3>${line.replace('### ', '')}</h3>`)
    }
    else if (line.startsWith('- ') || /^\d+\.\s/.test(line)) {
      if (!inList) { result.push('<ul>'); inList = true }
      const text = line.replace(/^-\s/, '').replace(/^\d+\.\s/, '')
      result.push(`<li>${text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`)
    }
    else if (line.length > 0) {
      if (inList) { result.push('</ul>'); inList = false }
      result.push(`<p>${line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`)
    }
  }
  
  if (inList) result.push('</ul>')
  return result.join('')
})

useHead({
  title: () => post.value?.title ? `${post.value.title} | LeadDistro Blog` : 'LeadDistro Blog',
  meta: () => post.value ? [
    { name: 'description', content: post.value.description },
    { name: 'keywords', content: post.value.keywords },
    { property: 'og:title', content: post.value.title },
    { property: 'og:description', content: post.value.description },
    { property: 'og:type', content: 'article' },
    { name: 'robots', content: 'index, follow' },
    { rel: 'canonical', href: `https://www.leaddistro.site/blog/${slug.value}` }
  ] : [],
  script: () => post.value ? [{
    type: 'application/ld+json',
    children: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.value.title,
      "description": post.value.description,
      "url": `https://www.leaddistro.site/blog/${slug.value}`,
      "publisher": {
        "@type": "Organization",
        "name": "LeadDistro",
        "url": "https://www.leaddistro.site"
      }
    })
  }] : []
})
</script>

<template>
  <div class="post-container">
    <button @click="router.push('/blog')" class="back-btn">← Volver al blog</button>
    
    <article v-if="post" class="post-content">
      <header class="post-header">
        <h1>{{ post.title }}</h1>
        <p class="post-description">{{ post.description }}</p>
      </header>
      
      <div class="post-body" v-html="formattedContent"></div>
      
      <div class="post-cta">
        <h3>¿Listo para automatizar tu distribución de leads?</h3>
        <button @click="router.push('/register')" class="btn-primary">
          Empezar gratis →
        </button>
      </div>
    </article>
    
    <div v-else class="not-found">
      <h2>Artículo no encontrado</h2>
      <button @click="router.push('/blog')">Volver al blog</button>
    </div>
  </div>
</template>

<style scoped>
.post-container {
  min-height: 100vh;
  background: #0f172a;
  color: #e2e8f0;
  padding: 100px 24px 60px;
  max-width: 800px;
  margin: 0 auto;
}

.back-btn {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 0.95rem;
  cursor: pointer;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.back-btn:hover {
  color: #3b82f6;
}

.post-header {
  margin-bottom: 40px;
}

.post-header h1 {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 16px;
  line-height: 1.2;
}

.post-description {
  font-size: 1.2rem;
  color: #94a3b8;
  line-height: 1.6;
}

.post-body {
  line-height: 1.8;
  font-size: 1.05rem;
  color: #cbd5e1;
}

.post-body :deep(h2) {
  color: white;
  font-size: 1.5rem;
  margin: 32px 0 16px;
  padding-top: 16px;
  border-top: 1px solid #334155;
}

.post-body :deep(p) {
  margin-bottom: 16px;
}

.post-body :deep(li) {
  margin-bottom: 12px;
  padding-left: 8px;
}

.post-body :deep(ul) {
  margin: 16px 0;
  padding-left: 24px;
}

.post-body :deep(ul li) {
  margin-bottom: 8px;
}

.post-body :deep(h3) {
  color: #e2e8f0;
  font-size: 1.25rem;
  margin: 24px 0 12px;
  font-weight: 600;
}

.post-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

.post-body :deep(td) {
  padding: 12px;
  border: 1px solid #334155;
  color: #cbd5e1;
}

.post-body :deep(tr:first-child td) {
  background: #1e293b;
  font-weight: 600;
  color: white;
}

.post-body :deep(strong) {
  color: #3b82f6;
}

.post-body :deep(code) {
  background: #1e293b;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
  color: #22c55e;
}

.post-cta {
  margin-top: 60px;
  padding: 40px;
  background: linear-gradient(135deg, #1e293b, #334155);
  border-radius: 16px;
  text-align: center;
}

.post-cta h3 {
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: white;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  opacity: 0.9;
}

.not-found {
  text-align: center;
  padding: 80px 0;
}

.not-found h2 {
  margin-bottom: 20px;
}

.not-found button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
}
</style>