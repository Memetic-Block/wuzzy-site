# Smart Search Syntax - Quick Reference

## 🎯 **How It Works**

The search system automatically detects your intent from syntax patterns:

### **Search Types & Examples**

| Type | Syntax | Example | Description |
|------|---------|---------|-------------|
| 🌟 **Wildcard** | `*` | `tags:Content-Type=audio/*` | Matches patterns (audio/mp3, audio/wav, etc.) |
| 🎯 **Exact** | `"quotes"` | `tags:Title="Dark Side of the Moon"` | Exact phrase match only |
| 🤝 **Fuzzy AND** | `,comma` | `tags:Genre=jazz,blues` | Must contain ALL terms (jazz-like AND blues-like) |
| 🔀 **Fuzzy OR** | `separate` | `tags:Type=music tags:Type=audio` | Contains ANY terms (music-like OR audio-like) |

### **Visual Chips**
- 🟡 **Yellow** = Wildcard search
- 🔵 **Blue** = Exact match  
- 🟣 **Pink** = Fuzzy AND
- 🟢 **Green** = Fuzzy OR

## 🚀 **Real Examples**

```bash
# Find all audio files
tags:Content-Type=audio/*

# Find specific song
tags:Title="Bohemian Rhapsody"

# Find jazz-rock fusion (must have both)
tags:Genre=jazz,rock

# Find music OR audio content (either)
tags:Type=music tags:Type=audio

# Complex search
tags:Content-Type=audio/* tags:Genre=jazz,fusion tags:Artist="Miles Davis" first:10
```

## 🎵 **Music Discovery Examples**

```bash
# All Beatles songs
tags:Artist="The Beatles" tags:Content-Type=audio/*

# Jazz or Blues music
tags:Genre=jazz tags:Genre=blues

# Ambient electronic music (both terms required)
tags:Style=ambient,electronic

# Any Pink Floyd content
tags:Artist=*Pink*Floyd*

# Exact album search
tags:Album="The Dark Side of the Moon"
```

## 💡 **Pro Tips**

1. **Mix & Match**: Combine different search types in one query
2. **Use `*`**: Great for partial matches and content type filtering  
3. **Quote Phrases**: Use quotes for exact titles, names, or phrases
4. **Comma = AND**: Use commas when you need ALL terms present
5. **Separate = OR**: Repeat tag names when you want ANY match
6. **Help Button**: Click `?` in the UI for interactive examples

The system is designed to be intuitive - just type naturally and let the smart parser handle the rest!