-- Body weight becomes grams.
--
-- The column has always held pounds. `helper/units.ts` now treats every stored weight as
-- grams and converts to lb/kg only for display, so the existing rows have to be converted
-- exactly once, here.
--
-- 453.59237 is exact (a pound is defined as 0.45359237 kg), and ROUND keeps the result an
-- integer so a 0.1 lb reading (45.36 g) does not accumulate error across the table.
UPDATE `weightItem` SET `weight` = CAST(ROUND(`weight` * 453.59237) AS INTEGER);
