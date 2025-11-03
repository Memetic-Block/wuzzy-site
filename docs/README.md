# Wuzzy Documentation

Welcome to Wuzzy - an advanced search interface for Arweave content with intelligent syntax detection.

## 📚 Documentation

### Search Guides
- **[Quick Start Guide](SEARCH_QUICK_START.md)** - Get started in 2 minutes
- **[Complete Search Syntax](SEARCH_SYNTAX.md)** - Comprehensive syntax reference
- **[Search Syntax Reference](search-syntax-guide.md)** - Quick reference table

### Technical Documentation  
- **[Goldsky Integration](goldsky-integration.md)** - Advanced GraphQL features
- **[GraphQL Composable](../src/docs/graphql-composable.md)** - Developer guide

## 🎯 Search Overview

Wuzzy features an intelligent search system that automatically detects your intent:

### Smart Syntax Detection
```bash
audio/*           → Wildcard matching (🟡 yellow chips)
"exact phrase"    → Exact matching (🔵 blue chips)  
jazz,blues        → Fuzzy OR matching (� green chips)
separate tags     → Fuzzy AND matching (� pink chips)
tag:=MirrorXYZ   → Value-only search (🎯 special)
```

### Key Features
- **🧠 Auto-Detection**: System recognizes search patterns automatically
- **🎨 Visual Chips**: Color-coded search terms show match types
- **⚡ Enhanced Performance**: Powered by Goldsky's optimized GraphQL
- **🔍 Fuzzy Matching**: Finds variations and similar terms
- **📱 User-Friendly**: Natural syntax that matches user expectations

## 🚀 Quick Examples

```bash
# Music discovery
tag:Content-Type=audio/* tag:Genre=jazz,fusion

# Exact matches
tag:Artist="The Beatles" tag:Album="Abbey Road"

# Flexible search
tag:Type=music tag:Type=audio tag:Style=*rock*

# Complex queries
tag:Content-Type=audio/* tag:Genre=jazz tag:Year=196* first:20
```

## 🛠 For Developers

### Key Components
- **AudioSearchSimple.vue** - Main search interface with syntax parsing
- **gql.ts** - GraphQL composable with Goldsky integration  
- **GlobalAudioPlayer.vue** - Persistent audio playback
- **TransactionSearch.vue** - Advanced transaction filtering

### Architecture
- Vue 3 + Composition API
- TypeScript for type safety
- Vite-SSG for static generation
- Goldsky GraphQL for enhanced performance

---

**Getting Started**: Check out the [Quick Start Guide](SEARCH_QUICK_START.md) to begin searching, or dive into the [Complete Syntax Reference](SEARCH_SYNTAX.md) for advanced features.