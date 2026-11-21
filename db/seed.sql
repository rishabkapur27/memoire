-- Starter menu. Edit prices and daily capacity later from /admin/products.
insert into products (slug, name, french_name, description, price_inr, weight_grams, daily_capacity, sort_order) values
  ('pain-de-campagne', 'Country Sourdough', 'Pain de Campagne',
   'Our house loaf. Naturally leavened over 36 hours, a blistered crust and a soft, open crumb with a gentle tang.',
   420, 800, 24, 1),
  ('baguette-tradition', 'Baguette Tradition', 'Baguette de Tradition',
   'Flour, water, salt, levain. Long fermented and baked hot for a shattering crust. Best eaten the same day.',
   180, 250, 40, 2),
  ('pain-complet', 'Whole Wheat Levain', 'Pain Complet',
   'Stone-milled whole wheat with a little rye. Nutty, deeply flavoured and keeps well for three days.',
   380, 750, 16, 3),
  ('fougasse-olives', 'Olive Fougasse', 'Fougasse aux Olives',
   'The leaf-shaped bread of Provence, studded with Kalamata olives, rosemary and good olive oil.',
   320, 350, 12, 4),
  ('brioche-nanterre', 'Brioche Loaf', 'Brioche Nanterre',
   'Rich with butter and eggs, golden and pillowy. Made for French toast, or just a warm slice with jam.',
   450, 500, 12, 5),
  ('pain-de-mie', 'Pullman Sandwich Loaf', 'Pain de Mie',
   'A fine, tight crumb and a thin crust. The sandwich bread you have been looking for.',
   280, 600, 16, 6)
on conflict (slug) do nothing;
