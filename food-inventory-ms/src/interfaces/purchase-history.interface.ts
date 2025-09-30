export interface PurchaseHistoryCreate {
    id?: number;
    orderId: number;
    ingredientToPurchase?: string;
    quantityPurchased: number;
    createdAt?: Date;
    updatedAt?: Date;
}