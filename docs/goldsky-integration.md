# Goldsky GraphQL Integration

This application now uses [Goldsky's Search GraphQL Gateway](https://arweave-search.goldsky.com/graphql) which provides enhanced search capabilities over the standard Arweave GraphQL API.

## Enhanced Features

### 1. Wildcard Search
Search for all audio files using wildcard patterns:
```
tags:Content-Type=audio/*
```

### 2. Fuzzy Search
Find similar content with fuzzy matching:
```javascript
// Search for cat-like OR dog-like content
const results = await getTransactions({
  tags: [createFuzzyTagFilter('Content-Type', ['cat', 'dog'], 'OR')]
})

// Search for content that contains BOTH cat-like AND dog-like terms
const results = await getTransactions({
  tags: [createFuzzyTagFilter('Content-Type', ['cat', 'dog'], 'AND')]
})
```

### 3. Tag Name Only Search
Search for transactions that have a specific tag, regardless of value:
```javascript
const results = await getTransactions({
  tags: [createTagNameFilter('In-Response-To-ID')]
})
```

### 4. Tag Value Only Search  
Search for transactions with specific tag values, regardless of tag name:
```javascript
const results = await getTransactions({
  tags: [createTagValueFilter(['MirrorXYZ'])]
})
```

### 5. L1 Transactions Only
Exclude bundled (L2) transactions:
```javascript
const results = await getTransactions({
  bundledIn: null  // Only L1 transactions
})
```

### 6. Wildcard Content Types
Use wildcard matching for content types:
```javascript
const audioResults = await getTransactions({
  tags: [createWildcardTagFilter('Content-Type', ['audio/*'])]
})

const imageResults = await getTransactions({
  tags: [createWildcardTagFilter('Content-Type', ['image/*'])]
})
```

## Performance Benefits

- **Faster Response Times**: Optimized backend for complex queries
- **Better Multi-tag Search**: Improved performance for searches with multiple tag filters
- **Enhanced Filtering**: More efficient wildcard and fuzzy search capabilities
- **Backwards Compatible**: All existing queries continue to work exactly the same

## Usage Examples

### Audio Search with Wildcard
Instead of specifying exact MIME types:
```
tags:Content-Type=audio/mpeg tags:Content-Type=audio/wav tags:Content-Type=audio/flac
```

You can now use:
```
tags:Content-Type=audio/*
```

### Smart Search Syntax
The UI now features intuitive search syntax with automatic match type detection:

**🌟 Wildcard Search (Yellow chips) - Use `*`:**
```
tags:Content-Type=audio/*
tags:Genre=*jazz*
tags:Title=*love*
```

**🎯 Exact Match (Blue chips) - Use `"quotes"`:**
```
tags:Title="Dark Side of the Moon"
tags:Artist="The Beatles"
tags:Album="OK Computer"
```

**🤝 Fuzzy AND Search (Pink chips) - Use `,comma`:**
```
tags:Genre=jazz,blues        # Must contain both jazz-like AND blues-like
tags:Description=cute,small  # Must contain both cute-like AND small-like
tags:Tags=music,instrumental # Must contain both music-like AND instrumental-like
```

**🔀 Fuzzy OR Search (Green chips) - Use `separate tags`:**
```
tags:Type=music tags:Type=audio     # Contains music-like OR audio-like
tags:Genre=rock tags:Genre=pop      # Contains rock-like OR pop-like  
tags:Style=jazz tags:Style=blues    # Contains jazz-like OR blues-like
```

### Finding Music Content
Search for music-related content using fuzzy matching:
```javascript
const musicResults = await getTransactions({
  tags: [
    createFuzzyTagFilter('Type', ['music', 'audio', 'song'], 'OR'),
    createWildcardTagFilter('Content-Type', ['audio/*'])
  ]
})
```

### Advanced Content Discovery
Find all transactions with file names:
```javascript
const filesWithNames = await getTransactions({
  tags: [createTagNameFilter('File-Name')],
  bundledIn: null  // L1 only for better performance
})
```

## Search Syntax Logic

The new syntax follows intuitive conventions:

### 🧠 **Why This Syntax?**
1. **`*` = Wildcard** - Universal pattern matching symbol
2. **`"quotes"` = Exact** - Common convention for exact phrases
3. **`,comma` = AND** - Items in a list must all be present
4. **`separate` = OR** - Multiple options where any can match

### 🎯 **Smart Auto-Detection:**
```
tags:Content-Type=audio/*           → WILDCARD (contains *)
tags:Title="Exact Song Name"        → EXACT (quoted)
tags:Genre=jazz,blues               → FUZZY_AND (comma-separated)
tags:Type=music tags:Type=audio     → FUZZY_OR (repeated tag names)
```

### 🔄 **Real-World Examples:**
```bash
# Find all audio content
tags:Content-Type=audio/*

# Find specific album
tags:Album="Dark Side of the Moon"

# Find jazz-blues fusion (must have both elements)
tags:Genre=jazz,blues

# Find music OR audio content (either type)
tags:Type=music tags:Type=audio

# Complex search combining all types
tags:Content-Type=audio/* tags:Genre=jazz,blues tags:Artist="Miles Davis"
```

## Migration Notes

- **Endpoint**: Now defaults to `https://arweave-search.goldsky.com/graphql`
- **Backwards Compatibility**: All existing queries work without changes
- **Enhanced Types**: New TypeScript interfaces support optional tag names/values
- **Intuitive Syntax**: Natural search patterns that users expect
- **Visual Feedback**: Color-coded chips show match types instantly

The application automatically detects search intent from syntax patterns, making advanced search accessible to all users while maintaining full compatibility with existing Arweave GraphQL syntax.