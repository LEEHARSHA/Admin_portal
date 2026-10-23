import assert from "node:assert/strict";
import test from "node:test";
import { isAllowedProductImageUrl, productImage, type MarketplaceProduct } from "./admin-api.ts";

const decathlonImage =
  "https://contents.mediadecathlon.com/p1899141/682c88daaeb6785c264ccc027406ea84/p1899141.jpg?format=auto&quality=70&f=969x0";
const indiaMartImage =
  "https://5.imimg.com/data5/WHATSAPP/Default/2024/3/402239152/JL/TB/NV/4289864/new-product-1000x1000.jpeg";
const firebaseStorageImage =
  "https://firebasestorage.googleapis.com/v0/b/sellerportal-2786c.firebasestorage.app/o/sellers%2Fseller-1%2Fproducts%2F123e4567-e89b-42d3-a456-426614174000.webp?alt=media&token=test-image-token";

function product(images?: string[]): MarketplaceProduct {
  return {
    id: "test-product",
    name: "Test product",
    category: "Test",
    price: 10,
    stock: 1,
    status: "pending",
    sellerId: "test-seller",
    images,
  };
}

test("selects product URLs from supported providers", () => {
  assert.equal(productImage(product([decathlonImage])), decathlonImage);
  assert.equal(productImage(product([indiaMartImage])), indiaMartImage);
  assert.equal(productImage(product([firebaseStorageImage])), firebaseStorageImage);
});

test("skips malformed and unsupported product URLs", () => {
  assert.equal(productImage(product(["not a URL", "http://5.imimg.com/data5/image.jpg"])), "");
  assert.equal(
    isAllowedProductImageUrl("https://5.imimg.com/other/image.jpg"),
    false,
  );
  assert.equal(
    isAllowedProductImageUrl("https://untrusted.example/data5/image.jpg"),
    false,
  );
  assert.equal(
    isAllowedProductImageUrl(firebaseStorageImage.replace("sellerportal-2786c.firebasestorage.app", "untrusted.example")),
    false,
  );
});

test("returns the first valid URL and handles missing image arrays", () => {
  assert.equal(
    productImage(product(["https://untrusted.example/image.jpg", indiaMartImage])),
    indiaMartImage,
  );
  assert.equal(productImage(product([])), "");
  assert.equal(productImage(product()), "");
});
