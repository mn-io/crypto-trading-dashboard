
type TransactionBaseDatum = {
    time: number;
    totalPriceUsd: string;
    totalAmountAsset: string;
    type: "Buy" | "Sell";
};

export type TransactionDatum = TransactionBaseDatum & {
    totalPriceUsdNumber: number;
    totalAmountAssetNumber: number;
};

export function createNewTransactionDatum(data: TransactionBaseDatum): TransactionDatum {
    return {
        time: data.time,
        totalPriceUsd: data.totalPriceUsd,
        totalAmountAsset: data.totalAmountAsset,
        type: data.type,
        totalPriceUsdNumber: parseFloat(data.totalPriceUsd),
        totalAmountAssetNumber: parseFloat(data.totalAmountAsset),
    }
};
