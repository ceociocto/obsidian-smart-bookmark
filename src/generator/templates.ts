/**
 * Note templates for generating Obsidian notes
 */

export const DEFAULT_TEMPLATE = `---
title: "{{title}}"
url: "{{url}}"
date_added: {{dateAdded}}
folder: {{folder}}
tags: {{tags}}
category: {{category}}
description: "{{description}}"
keywords: {{keywords}}
---

# {{title}}

## Description
{{description}}

## Category
{{category}}

## Tags
{{tags}}

## Source
[{{title}}]({{url}})

---

_Last updated: {{lastUpdated}}_
`;

export const MINIMAL_TEMPLATE = `---
title: "{{title}}"
url: "{{url}}"
date_added: {{dateAdded}}
tags: {{tags}}
---

# [{{title}}]({{url}})

{{description}}

---

**Category**: {{category}} | **Folder**: {{folder}}
`;

export const DETAILED_TEMPLATE = `---
title: "{{title}}"
url: "{{url}}"
date_added: {{dateAdded}}
folder: {{folder}}
tags: {{tags}}
category: {{category}}
language: {{language}}
author: {{author}}
published_date: {{publishedDate}}
description: "{{description}}"
keywords: {{keywords}}
summary: "{{summary}}"
---

# {{title}}

> {{description}}

## Summary
{{summary}}

## Information
- **Category**: {{category}}
- **Language**: {{language}}
- **Author**: {{author}}
- **Published**: {{publishedDate}}

## Keywords
{{keywords}}

## Tags
{{tags}}

## Source
[Visit website]({{url}})

---

*Added to bookmarks on {{dateAdded}}*
*Last updated: {{lastUpdated}}*
`;

export const TEMPLATE_MAP = {
	default: DEFAULT_TEMPLATE,
	minimal: MINIMAL_TEMPLATE,
	detailed: DETAILED_TEMPLATE,
} as const;

export type TemplateType = keyof typeof TEMPLATE_MAP;
