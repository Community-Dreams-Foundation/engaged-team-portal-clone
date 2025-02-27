
import { ReactNode } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

interface MarkdownProps {
  children: string
}

export function Markdown({ children }: MarkdownProps) {
  const parseMarkdown = (content: string): string => {
    // Custom processing for @[username](userId) mentions
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g
    const processedContent = content.replace(
      mentionRegex,
      '<span class="bg-blue-100 dark:bg-blue-800 rounded px-1 py-0.5">@$1</span>'
    )

    // Parse markdown - ensure content is string
    const rawHtml = marked.parse(String(processedContent), { breaks: true })
    
    // Sanitize HTML to prevent XSS
    const cleanHtml = DOMPurify.sanitize(rawHtml, {
      USE_PROFILES: { html: true },
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
        'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
        'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'span', 'img'
      ],
      ALLOWED_ATTR: [
        'href', 'name', 'target', 'class', 'id', 'style', 'src', 'alt', 'rel'
      ]
    })
    
    return cleanHtml
  }

  return (
    <div 
      className="prose prose-sm dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: parseMarkdown(children) }} 
    />
  )
}
