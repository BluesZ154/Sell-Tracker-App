import api from "./api";

export const getBusinessReport = async () => {

  try {

    // =========================
    // FETCH ALL DATA
    // =========================

    const [
      productRes,
      transactionRes,
      stockRes
    ] = await Promise.all([
      api.get("/api/product/get"),
      api.get("/api/transaction/get"),
      api.get("/api/stocklogs/get")
    ]);

    const products = productRes.data;
    const transactions = transactionRes.data;
    const stockLogs = stockRes.data;

    // =========================
    // TOTAL REVENUE
    // =========================

    const totalRevenue = transactions.reduce(
      (sum, transaction) =>
        sum + transaction.total,
      0
    );

    // =========================
    // SOLD PRODUCTS
    // =========================

    let soldProducts = {};

    transactions.forEach(transaction => {

      transaction.items.forEach(item => {

        if (!soldProducts[item.productId]) {

          soldProducts[item.productId] = {
            name: item.name,
            quantity: 0
          };

        }

        soldProducts[item.productId].quantity += item.quantity;

      });

    });

    // =========================
    // BEST SELLING
    // =========================

    const bestSellingId =
      Object.keys(soldProducts).length > 0
        ? Object.keys(soldProducts).reduce(
            (best, id) =>
              soldProducts[id].quantity >
              soldProducts[best].quantity
                ? id
                : best
          )
        : null;

    const bestSelling =
      bestSellingId
        ? soldProducts[bestSellingId]
        : null;

    // =========================
    // WORST SELLING
    // =========================

    const worstSellingId =
      Object.keys(soldProducts).length > 0
        ? Object.keys(soldProducts).reduce(
            (worst, id) =>
              soldProducts[id].quantity <
              soldProducts[worst].quantity
                ? id
                : worst
          )
        : null;

    const worstSelling =
      worstSellingId
        ? soldProducts[worstSellingId]
        : null;

    // =========================
    // HIGHEST PRICE
    // =========================

    const highestPrice = products.reduce(
      (highest, product) => {

        if (!highest) return product;

        return product.price > highest.price
          ? product
          : highest;

      },
      null
    );

    // =========================
    // LOWEST PRICE
    // =========================

    const lowestPrice = products.reduce(
      (lowest, product) => {

        if (!lowest) return product;

        return product.price < lowest.price
          ? product
          : lowest;

      },
      null
    );

    // =========================
    // LOW STOCK
    // =========================

    const lowStockProducts = products.filter(
      product => product.stock <= 5
    );

    // =========================
    // HIGHEST STOCK
    // =========================

    const highestStockProduct = products.reduce(
      (highest, product) => {

        if (!highest) return product;

        return product.stock > highest.stock
          ? product
          : highest;

      },
      null
    );

    // =========================
    // RECENT DATA
    // =========================

    const recentTransactions =
      transactions.slice(0, 5);

    const recentRestock =
      stockLogs.slice(0, 5);

    // =========================
    // BUSINESS INSIGHT
    // =========================

    const businessInsight = `
      Penjualan toko saat ini menghasilkan total pemasukan sebesar
      Rp. ${totalRevenue.toLocaleString("id-ID")}
      dari ${transactions.length} transaksi.

      Produk terlaris saat ini adalah
      ${bestSelling?.name || "-"}
      dengan total penjualan
      ${bestSelling?.quantity || 0} item.

      Sementara itu, produk dengan penjualan terendah adalah
      ${worstSelling?.name || "-"}
      dengan total penjualan
      ${worstSelling?.quantity || 0} item.

      Produk dengan stok tertinggi saat ini adalah
      ${highestStockProduct?.name || "-"}
      dengan sisa stok
      ${highestStockProduct?.stock || 0} item.

      ${
        lowStockProducts.length > 0
          ? `Terdapat ${lowStockProducts.length} produk dengan stok rendah yang perlu segera direstock, seperti ${lowStockProducts[0]?.name}.`
          : `Semua produk masih memiliki stok yang aman.`
      }
    `;

    // =========================
    // FINAL REPORT OBJECT
    // =========================

    return {

      // RAW DATA
      products,
      transactions,
      stockLogs,

      // SUMMARY
      totalRevenue,
      totalTransactions: transactions.length,
      totalProducts: products.length,

      // SELLING
      bestSelling,
      worstSelling,

      // PRICE
      highestPrice,
      lowestPrice,

      // STOCK
      lowStockProducts,
      highestStockProduct,

      // RECENT
      recentTransactions,
      recentRestock

    };

  } catch (error) {

    console.log(error.message);

    return null;

  }

};