// server/prisma/seed.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

console.log('DB =', (process.env.DATABASE_URL || '').replace(/:[^:@]*@/, ':****@'));

async function upsertByName(model, nameField, nameValue, extraCreate = {}) {
  return model.upsert({
    where: { [nameField]: nameValue },
    update: {},
    create: { [nameField]: nameValue, ...extraCreate },
  });
}

async function countAll() {
  const [
    nutrient, allergen, brand, product, serving,
    ingredient, prodIng, prodNut, prodAll
  ] = await Promise.all([
    prisma.nutrient.count(),
    prisma.allergen.count(),
    prisma.brand.count(),
    prisma.product.count(),
    prisma.serving.count(),
    prisma.ingredient.count(),
    prisma.productIngredient.count(),
    prisma.productNutrient.count(),
    prisma.productAllergen.count(),
  ]);
  console.log({
    counts: { nutrient, allergen, brand, product, serving, ingredient, prodIng, prodNut, prodAll }
  });
}

async function main() {
  console.log('Seeding started');

  // 1) Nutrient master
  await prisma.nutrient.createMany({
    data: [
      { key: 'energy_kcal',    name: 'Calories',            unit: 'kcal' },
      { key: 'fat_g',          name: 'Total Fat',           unit: 'g' },
      { key: 'saturated_fat_g',name: 'Saturated Fat',       unit: 'g' },
      { key: 'trans_fat_g',    name: 'Trans Fat',           unit: 'g' },
      { key: 'cholesterol_mg', name: 'Cholesterol',         unit: 'mg' },
      { key: 'sodium_mg',      name: 'Sodium',              unit: 'mg' },
      { key: 'potassium_mg',   name: 'Potassium',           unit: 'mg' },
      { key: 'carbs_g',        name: 'Total Carbohydrate',  unit: 'g' },
      { key: 'fiber_g',        name: 'Dietary Fiber',       unit: 'g' },
      { key: 'sugars_g',       name: 'Sugars',              unit: 'g' },
      { key: 'protein_g',      name: 'Protein',             unit: 'g' },
      { key: 'vitamin_c_mg',   name: 'Vitamin C',           unit: 'mg' },
      { key: 'calcium_mg',     name: 'Calcium',             unit: 'mg' },
      { key: 'iron_mg',        name: 'Iron',                unit: 'mg' },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Nutrient master seeded');

  // 2) Allergen master
  await prisma.allergen.createMany({
    data: [
      { key: 'gluten',   label: 'Gluten' },
      { key: 'milk',     label: 'Milk' },
      { key: 'soy',      label: 'Soy' },
      { key: 'egg',      label: 'Egg' },
      { key: 'peanut',   label: 'Peanut' },
      { key: 'tree_nut', label: 'Tree nut' },
      { key: 'fish',     label: 'Fish' },
      { key: 'shellfish',label: 'Shellfish' },
      { key: 'sesame',   label: 'Sesame' },
    ],
    skipDuplicates: true,
  });
  console.log('Allergen master seeded');

  // 3) Brand (unique: name)
  const cocaColaBrand = await prisma.brand.upsert({
    where:  { name: 'Coca-Cola' },
    update: {},
    create: { name: 'Coca-Cola' },
  });
  console.log('Brand ready:', cocaColaBrand.id);

  // 4) Product (unique: barcode) — keep leading/trailing zeros
  const barcode = '06782900';
  const cocaCola = await prisma.product.upsert({
    where:  { barcode },
    update: {},
    create: {
      name: 'Coca-Cola',
      barcode,
      brandId: cocaColaBrand.id,
    },
  });
  console.log('Product ready:', cocaCola.id);

  // 5) Serving
  let serving = await prisma.serving.findFirst({
    where: { productId: cocaCola.id, amount: 1, unit: 'can', householdMeasure: '355 ml' },
  });
  if (!serving) {
    serving = await prisma.serving.create({
      data: { productId: cocaCola.id, amount: 1, unit: 'can', householdMeasure: '355 ml' },
    });
  }
  console.log('Serving ready:', serving.id);

  // 6) Ingredients (unique: name)
  const ingredientNames = [
    'Carbonated water',
    'Sugar/glucose-fructose',
    'Caramel colour',
    'Phosphoric acid',
    'Natural flavour',
    'Caffeine',
  ];
  const ingredients = [];
  for (const name of ingredientNames) {
    ingredients.push(await prisma.ingredient.upsert({
      where:  { name },
      update: {},
      create: { name },
    }));
  }
  console.log('Ingredients upserted:', ingredients.map(x => x.id));

  await prisma.productIngredient.createMany({
    data: ingredients.map((x, i) => ({
      productId: cocaCola.id,
      ingredientId: x.id,
      orderIndex: i,
    })),
    skipDuplicates: true, // @@unique([productId, ingredientId])
  });
  console.log('ProductIngredient linked');

  // 7) Nutrients per serving
  const nutrientList = await prisma.nutrient.findMany();
  const idMap = Object.fromEntries(nutrientList.map(n => [n.key, n.id]));

  await prisma.productNutrient.createMany({
    data: [
      { productId: cocaCola.id, servingId: serving.id, nutrientId: idMap['energy_kcal'], amount: 140 },
      { productId: cocaCola.id, servingId: serving.id, nutrientId: idMap['fat_g'],        amount: 0 },
      { productId: cocaCola.id, servingId: serving.id, nutrientId: idMap['carbs_g'],      amount: 39 },
      { productId: cocaCola.id, servingId: serving.id, nutrientId: idMap['sugars_g'],     amount: 39 },
      { productId: cocaCola.id, servingId: serving.id, nutrientId: idMap['sodium_mg'],    amount: 25 },
      { productId: cocaCola.id, servingId: serving.id, nutrientId: idMap['potassium_mg'], amount: 10 },
      { productId: cocaCola.id, servingId: serving.id, nutrientId: idMap['protein_g'],    amount: 0 },
    ],
    skipDuplicates: true, // @@unique([productId, servingId, nutrientId])
  });
  console.log('ProductNutrient created');

  // 8) Allergen flags (all false)
  const allergens = await prisma.allergen.findMany();
  await prisma.productAllergen.createMany({
    data: allergens.map(a => ({
      productId: cocaCola.id,
      allergenId: a.id,
      contains: false,
      mayContain: false,
      facility: false,
    })),
    skipDuplicates: true, // @@unique([productId, allergenId])
  });
  console.log('ProductAllergen created');

  await countAll();
  console.log('Seeding finished');
}

main()
  .catch(err => {
    console.error('Seeding error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
