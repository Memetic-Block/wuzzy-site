# Wuzzy Search Syntax Documentation

## Overview

Wuzzy uses an intelligent search system powered by Goldsky's GraphQL gateway that automatically detects your search intent and applies the appropriate matching strategy. The syntax is designed to be intuitive while providing powerful advanced search capabilities.

## Quick Reference

| Syntax Pattern | Match Type | Example | Visual Chip |
|----------------|------------|---------|-------------|
| `*` | Wildcard | `tag:Content-Type=audio/*` | 🟡 Yellow |
| `"quotes"` | Exact | `tag:Title="Bohemian Rhapsody"` | 🔵 Blue |
| `,comma` | Fuzzy OR | `tag:Genre=jazz,blues` | � Green |
| `separate` | Fuzzy AND | `tag:Type=music tag:Type=audio` | � Pink |
| `=value` | Value-only | `tag:=MirrorXYZ` | 🎯 Special |

## Search Types Explained

### 🌟 Wildcard Search

**When to use:** Pattern matching, content type filtering, partial name searches

**Syntax:** Include `*` anywhere in your search value
```
tag:Content-Type=audio/*     # All audio files (mp3, wav, flac, etc.)
tag:Artist=*Beatles*         # Artist names containing "Beatles"
tag:Title=*love*             # Song titles containing "love"
tag:Genre=*rock*             # Genres containing "rock" (rock, hard rock, prog rock)
```

**How it works:** The `*` character matches any sequence of characters, similar to file glob patterns.

### 🎯 Exact Match Search

**When to use:** Precise searches for specific titles, names, or phrases

**Syntax:** Wrap your search value in double quotes
```
tag:Title="Dark Side of the Moon"    # Exact album title
tag:Artist="The Beatles"             # Exact artist name
tag:Album="OK Computer"               # Exact album name
tag:Description="Live recording"     # Exact phrase in description
```

**How it works:** Only returns results that match the exact phrase, case-insensitive but no fuzzy matching.

### 🔀 Fuzzy OR Search

**When to use:** Content can match ANY of the specified alternatives

**Syntax:** Separate multiple terms with commas
```
tag:Genre=jazz,blues          # Contains jazz-like OR blues-like terms
tag:Style=ambient,electronic  # Contains ambient-like OR electronic-like terms
tag:Description=cat,cute      # Contains cat-like OR cute-like terms
tag:Tags=music,instrumental   # Contains music-like OR instrumental-like terms
```

**How it works:** Uses fuzzy matching to find variations of any term in the comma-separated list.

### 🤝 Fuzzy AND Search

**When to use:** Content must contain ALL specified terms or similar variations

**Syntax:** Repeat the same tag name with different values
```
tag:Type=music tag:Type=audio        # Must contain music-like AND audio-like terms
tag:Genre=rock tag:Genre=pop         # Must contain rock-like AND pop-like terms
tag:Style=jazz tag:Style=blues       # Must contain jazz-like AND blues-like terms
tag:Category=art tag:Category=photo  # Must contain art-like AND photo-like terms
```

**How it works:** Automatically combines repeated tag names into a single fuzzy AND query.

### 🎯 Value-only Search

**When to use:** Search across all tag values without specifying tag names

**Syntax:** Use `tag:=value` with no tag name
```
tag:=MirrorXYZ                # Find any tag containing "MirrorXYZ"
tag:="exact phrase"           # Find any tag with exact phrase
tag:=*pattern*                # Find any tag matching wildcard pattern
tag:=jazz,blues               # Find any tag with jazz OR blues (fuzzy)
```

**How it works:** Searches all tag values regardless of tag name, useful for discovering content patterns.

## Advanced Examples

### Music Discovery
```bash
# Find all Beatles audio content
tag:Artist="The Beatles" tag:Content-Type=audio/*

# Jazz or blues music from the 1960s
tag:Genre=jazz tag:Genre=blues tag:Year=196*

# Ambient electronic music (must have both characteristics)
tag:Style=ambient,electronic tag:Content-Type=audio/*

# Live recordings of any rock genre
tag:Description="live" tag:Genre=*rock*

# Specific album search
tag:Album="The Dark Side of the Moon" tag:Artist="Pink Floyd"
```

### Content Type Filtering
```bash
# All image formats
tag:Content-Type=image/*

# Audio files with metadata
tag:Content-Type=audio/* tag:Title=*

# Video content from specific creators
tag:Content-Type=video/* tag:Creator="Channel Name"
```

### Complex Searches
```bash
# Multi-criteria music search
tag:Content-Type=audio/* tag:Genre=jazz,fusion tag:Year=197* tag:Artist=*Davis* first:20

# Exact artist with flexible genre
tag:Artist="Miles Davis" tag:Genre=jazz tag:Genre=fusion tag:Genre=bebop

# Pattern matching with exact phrases
tag:Title=*love* tag:Album="Abbey Road" tag:Artist="The Beatles"
```

## Additional Search Parameters

### Result Limiting
```bash
first:20      # Limit to 20 results
first:50      # Limit to 50 results (max 100)
```

### Owner/Address Filtering
```bash
owner:1seRanklLU_1VTk8WSRV0KnwPNcnEu1BIAN0wEmuHPYE    # Specific wallet address
```

### Block Range Filtering
```bash
block:1000000-1100000    # Transactions in block range
block:1000000            # Transactions from block 1000000 onwards
```

## User Interface Features

### Visual Chips System
- **🟡 Yellow Chips:** Wildcard searches (`*` pattern)
- **🔵 Blue Chips:** Exact matches (`"quoted"` text)
- **🟣 Pink Chips:** Fuzzy AND (`,comma` separated)
- **🟢 Green Chips:** Fuzzy OR (`separate` repeated tags)

### Interactive Help
Click the `?` button in the search interface to see live examples and syntax help.

### Auto-Detection
The system automatically detects your search intent:
- Sees `*` → Applies wildcard matching
- Sees `"quotes"` → Uses exact matching  
- Sees `,commas` → Uses fuzzy AND
- Sees repeated tag names → Combines into fuzzy OR

## Best Practices

### 1. Start Simple, Add Complexity
```bash
# Start with basic search
tags:Artist=Beatles

# Add content type filter
tags:Artist=Beatles tags:Content-Type=audio/*

# Add genre specificity  
tags:Artist=Beatles tags:Content-Type=audio/* tags:Genre=rock,pop

# Add result limit
tags:Artist=Beatles tags:Content-Type=audio/* tags:Genre=rock,pop first:10
```

### 2. Use Appropriate Match Types
- **Wildcard** for flexible pattern matching
- **Exact** for known precise values
- **Fuzzy AND** when you need multiple characteristics
- **Fuzzy OR** when you want alternatives

### 3. Combine Strategies
```bash
# Mix exact and wildcard
tags:Artist="The Beatles" tags:Content-Type=audio/*

# Mix fuzzy AND with exact
tags:Genre=jazz,fusion tags:Album="Kind of Blue"

# Mix everything
tags:Content-Type=audio/* tags:Artist="Miles Davis" tags:Genre=jazz,bebop tags:Year=195* first:25
```

## Technical Details

### Powered by Goldsky
- **Enhanced Performance:** Optimized backend for complex queries
- **Advanced Matching:** Fuzzy algorithms handle variations and typos
- **Fast Response Times:** Especially for multi-tag searches
- **Backwards Compatible:** All standard Arweave GraphQL queries work

### GraphQL Integration
The search system translates your syntax into optimized GraphQL queries:

```graphql
# Wildcard example becomes:
{
  transactions(tags: [{name: "Content-Type", values: ["audio/*"], match: WILDCARD}])
}

# Fuzzy AND example becomes:  
{
  transactions(tags: [{name: "Genre", values: ["jazz", "blues"], match: FUZZY_AND}])
}

# Fuzzy OR example becomes:
{
  transactions(tags: [{name: "Genre", values: ["rock", "pop"], match: FUZZY_OR}])
}
```

## Troubleshooting

### Common Issues

**No results found:**
- Try using wildcard (`*`) for more flexible matching
- Check spelling - fuzzy search helps but exact quotes are strict
- Remove quotes to allow fuzzy matching

**Too many results:**
- Add more specific criteria
- Use exact matching with quotes
- Add `first:N` to limit results
- Combine multiple tag filters

**Unexpected results:**
- Check if you're using the right match type
- Wildcard matches more broadly than expected
- Fuzzy matching includes similar terms

### Examples of Common Fixes

```bash
# Problem: No results for exact artist name
tags:Artist="Beatles"

# Solution: Use fuzzy matching
tags:Artist=Beatles

# Problem: Too broad wildcard search
tags:Title=*

# Solution: Add more criteria
tags:Title=* tags:Content-Type=audio/* tags:Genre=rock

# Problem: Not finding variations
tags:Genre="Progressive Rock" 

# Solution: Use fuzzy matching
tags:Genre=progressive,rock
```

## Migration from Basic Search

### Old Style → New Style
```bash
# Old: Limited exact matching
tags:Content-Type=audio/mpeg

# New: Flexible wildcard
tags:Content-Type=audio/*

# Old: Single term search
tags:Genre=jazz

# New: Multi-term flexibility  
tags:Genre=jazz tags:Genre=blues        # OR
tags:Genre=jazz,fusion                  # AND
```

This search system provides professional-grade search capabilities while remaining intuitive for casual users. The visual chip system and auto-detection make it easy to learn, while the advanced syntax supports complex discovery workflows.