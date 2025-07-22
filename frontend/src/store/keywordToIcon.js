export const keywordToIcon = [
  { keyword: ["shirt", "tshirt", "top", "fashion"], icon: "👕" },
  { keyword: ["pants", "jeans", "shorts"], icon: "👖" },
  { keyword: ["dress", "skirt"], icon: "👗" },
  { keyword: ["shoes", "sneakers", "boots"], icon: "👟" },
  { keyword: ["hat", "cap"], icon: "🧢" },
  { keyword: ["glasses", "sunglasses"], icon: "🕶️" },
  { keyword: ["watch", "clock"], icon: "⌚" },
  { keyword: ["jewelry", "ring", "necklace"], icon: "💍" },
  { keyword: ["bag", "backpack", "purse"], icon: "👜" },
  { keyword: ["phone", "smartphone"], icon: "📱" },
  { keyword: ["laptop", "notebook", "computer"], icon: "💻" },
  { keyword: ["television", "tv", "smart tv", "electronics"], icon: "📺" },
  { keyword: ["headphones", "earphones", "earbuds"], icon: "🎧" },
  { keyword: ["camera"], icon: "📷" },
  { keyword: ["kitchen", "cookware", "pan", "pot"], icon: "🍳" },
  { keyword: ["fruit", "vegetables"], icon: "🥦" },
  { keyword: ["meat", "fish", "seafood"], icon: "🍖" },
  { keyword: ["drink", "beverage", "coffee"], icon: "☕" },
  { keyword: ["milk", "cheese", "dairy"], icon: "🧀" },
  { keyword: ["snack", "cookie", "candy"], icon: "🍪" },
  { keyword: ["bread", "bakery"], icon: "🍞" },
  { keyword: ["frozen", "ice"], icon: "🧊" },
  { keyword: ["cleaning", "detergent", "hygiene"], icon: "🧽" },
  { keyword: ["book", "novel"], icon: "📚" },
  { keyword: ["stationery", "pen", "pencil"], icon: "✏️" },
  { keyword: ["toys", "game", "lego"], icon: "🧸" },
  { keyword: ["pet", "dog", "cat"], icon: "🐾" },
  { keyword: ["sports", "ball", "gym"], icon: "🏀" },
  { keyword: ["health", "vitamin", "medicine"], icon: "💊" },
  { keyword: ["beauty", "makeup", "cosmetic"], icon: "💄" },
  { keyword: ["travel", "luggage", "backpack"], icon: "🧳" },
  { keyword: ["home", "appliance", "kitchen", "fridge", "microwave", "blender", "washing machine"], icon: "🏠" }

];
export function getIconForCategory(title) {
  const titleLower = title.toLowerCase();

  for (const item of keywordToIcon) {
    if (item.keyword.some(kw => titleLower.includes(kw))) {
      return item.icon;
    }
  }

  return "📦"; // fallback nếu không có icon tương ứng
}
