
type TransactionBaseDatum = {
    time: number;
    totalPriceUsd: string;
    totalAmountAsset: string;
    type: "Buy" | "Sell";
};

export type TransactionDatum = TransactionBaseDatum & {
    totalPriceUsdNet: number;
    totalAmountAssetNet: number;
};

export function createNewTransactionDatum(data: TransactionBaseDatum): TransactionDatum {
    return {
        time: data.time,
        totalPriceUsd: data.totalPriceUsd,
        totalAmountAsset: data.totalAmountAsset,
        type: data.type,
        totalPriceUsdNet: parseFloat(data.totalPriceUsd),
        totalAmountAssetNet: parseFloat(data.totalAmountAsset),
    }
};

export function getNetHoldingSign(type: string){
     return type =="Buy" ? 1: -1;
}

//TODO: use proper number impl for adding
export function calcuateTotalNetHoldingAsset(data: TransactionDatum[]): number {
    return data.reduce((acc, item) => {
        return acc + item.totalAmountAssetNet * getNetHoldingSign(item.type);
    }, 0)
};

export function calcuateTotatNetPriceUsd(data: TransactionDatum[]): number {
    return data.reduce((acc, item) => {
        return acc + item.totalPriceUsdNet * getNetHoldingSign(item.type);
    }, 0);
};