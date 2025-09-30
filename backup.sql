INSERT INTO "Ingredient" (name, quantity_available)
VALUES
  ('tomato', 5),
  ('lemon', 5),
  ('potato', 5),
  ('rice', 5),
  ('ketchup', 5),
  ('lettuce', 5),
  ('onion', 5),
  ('cheese', 5),
  ('meat', 5),
  ('chicken', 5);


INSERT INTO "Recipe" (name) VALUES
  ('Tomato Rice Bowl'),
  ('Lemon Chicken'),
  ('Potato Cheese Soup'),
  ('Beef Burger with Ketchup'),
  ('Chicken Salad with Lettuce'),
  ('Onion Cheese Omelette');

INSERT INTO "RecipeIngredient" ("recipeId", "ingredientId", "quantity") VALUES
  (1, 1, 2),
  (1, 4, 1),
  (1, 7, 1);

-- Lemon Chicken (id=2)
INSERT INTO "RecipeIngredient" ("recipeId", "ingredientId", "quantity") VALUES
  (2, 2, 1),  -- lemon
  (2, 10, 2), -- chicken
  (2, 7, 1);  -- onion

-- Potato Cheese Soup (id=3)
INSERT INTO "RecipeIngredient" ("recipeId", "ingredientId", "quantity") VALUES
  (3, 3, 3),  -- potato
  (3, 8, 2),  -- cheese
  (3, 7, 1);  -- onion

-- Beef Burger with Ketchup (id=4)
INSERT INTO "RecipeIngredient" ("recipeId", "ingredientId", "quantity") VALUES
  (4, 9, 2),  -- meat
  (4, 5, 1),  -- ketchup
  (4, 8, 1),  -- cheese
  (4, 7, 1);  -- onion

-- Chicken Salad with Lettuce (id=5)
INSERT INTO "RecipeIngredient" ("recipeId", "ingredientId", "quantity") VALUES
  (5, 10, 2), -- chicken
  (5, 6, 2),  -- lettuce
  (5, 1, 1),  -- tomato
  (5, 2, 1);  -- lemon

-- Onion Cheese Omelette (id=6)
INSERT INTO "RecipeIngredient" ("recipeId", "ingredientId", "quantity") VALUES
  (6, 7, 2),  -- onion
  (6, 8, 2),  -- cheese
  (6, 3, 1);  -- potato