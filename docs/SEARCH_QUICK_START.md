# Wuzzy Search - Quick Start Guide

> **Smart search syntax with automatic intent detection**

## 🚀 How to Search

Just type naturally - Wuzzy automatically detects what you want:

```bash
tag:Content-Type=audio/*              # 🟡 All audio files (wildcard)
tag:Title="Bohemian Rhapsody"         # 🔵 Exact song title
tag:Genre=jazz,blues                  # � Jazz OR blues (fuzzy)  
tag:Type=music tag:Type=audio        # � Music AND audio (fuzzy)
tag:=MirrorXYZ                        # 🎯 Any tag with "MirrorXYZ" value
```

## 🎯 The 4 Search Types

| Pattern | Type | When to Use | Example |
|---------|------|-------------|---------|
| `*` | **Wildcard** | Flexible patterns | `audio/*`, `*Beatles*` |
| `"quotes"` | **Exact** | Precise matches | `"Dark Side of the Moon"` |
| `,comma` | **Fuzzy OR** | Want ANY term | `jazz,blues` |
| `separate` | **Fuzzy AND** | Need ALL terms | `tag:Type=music tag:Type=audio` |
| `=value` | **Value-only** | Search any tag | `tag:=MirrorXYZ` |

## 🎵 Music Examples

```bash
# Find Beatles songs
tag:Artist="The Beatles" tag:Content-Type=audio/*

# Jazz AND blues music (needs both characteristics)
tag:Genre=jazz tag:Genre=blues

# Electronic OR ambient music (either style)  
tag:Style=electronic,ambient

# Find any tag containing "MirrorXYZ"
tag:=MirrorXYZ

# Any Pink Floyd content
tag:Artist=*Pink*Floyd*

# Specific album
tag:Album="OK Computer" tag:Artist="Radiohead"
```

## 💡 Pro Tips

- **Visual Chips**: Colors show your search type automatically
- **Help Button**: Click `?` for interactive examples  
- **Mix & Match**: Combine different search types
- **Smart Parsing**: System detects your intent from syntax
- **No Quotes Needed**: Unless you want exact matching

## 🔧 Advanced Features

```bash
# Limit results
tag:Genre=rock first:20

# Block range
tag:Content-Type=audio/* block:1000000-1100000  

# Owner filter
owner:1seRanklLU_1VTk8WSRV0KnwPNcnEu1BIAN0wEmuHPYE

# Complex search
tag:Content-Type=audio/* tag:Genre=jazz,bebop tag:Year=195* first:10
```

**Powered by Goldsky** - Enhanced performance and fuzzy matching for better discovery.

---

💫 **Just start typing** - the smart parser handles the rest!