import * as anchor from "@coral-xyz/anchor";
import * as web3 from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { TokenVault } from "../target/types/token_vault";
import { BN } from "bn.js";

describe("Test", () => {
  // Configure the client to use the local cluster
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.TokenVault as anchor.Program<TokenVault>;

  const token_mint_address = new web3.PublicKey("4uUgYR1DMsWNq4UMx6coUFaouN4K6WybqpWyVDnDdG4z");

  // it("initializes a Vault Account", async () => {
  //   const [valut_token_account, bump1] = await web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("vaultTokenA"), token_mint_address.toBuffer()],
  //     program.programId
  //   )

  //   const [vaultPDA, bump2] = await web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("vault_auth"), token_mint_address.toBuffer()],
  //     program.programId
  //   );

  //   console.log("This is the Token vault_token_account", valut_token_account.toString())
  //   console.log("This is the vaultPDA: ", vaultPDA.toString());

  //   // Send Transaction
  //   const txHash = await program.methods
  //     .initializeVault()
  //     .accounts({
  //       vaultTokenAccount: valut_token_account,
  //       vault_auth: vaultPDA,
  //       payer: program.provider.publicKey,
  //       mint: token_mint_address,
  //       systemProgram: web3.SystemProgram.programId,
  //       tokenProgram: new web3.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
  //       rent: web3.SYSVAR_RENT_PUBKEY,
  //     })
  //     .rpc();

  //   console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);

  //   await program.provider.connection.confirmTransaction(txHash);
  // });

  // it("deposit to vault", async () => {
  //   const [valut_token_account, bump1] = await web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("vaultTokenA"), token_mint_address.toBuffer()],
  //     program.programId
  //   );

  //   const user_address = new web3.PublicKey("2ZZ63wbxbonZsD1XBdr4JeeNP6f5FY5NXh2M3Jjz7ez9");

  //   const [user_vault_account, bump3] = await web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("user_vault"), user_address.toBuffer() ,token_mint_address.toBuffer()],
  //     program.programId
  //   )

  //   const amount_to_deposit = new BN(10_000_000_000);

  //   const userATA = new web3.PublicKey("GzsqFZFN8D3xhqQWDxHXwcT86BjbDWzf9ykXxPjda1EZ");

  //   // Send Transaction
  //   const txHash = await program.methods
  //   .depositToVault(amount_to_deposit)
  //   .accounts({
  //     user: program.provider.publicKey,
  //     userTokenAccount: userATA,
  //     vaultTokenAccount: valut_token_account,
  //     userVaultState: user_vault_account,
  //     mint: token_mint_address,
  //     tokenProgram: new web3.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
  //     systemProgram: web3.SystemProgram.programId,
  //   })
  //   .rpc();

  //   console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);

  //   // Confirm Transaction
  //   await program.provider.connection.confirmTransaction(txHash);
  // });

  it("Withdraws the token", async() => {
    const [vault_token_account, bump1] = await web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vaultTokenA"), token_mint_address.toBuffer()],
      program.programId
    )

    const [vault_PDA, bump2] = await web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault_auth"), token_mint_address.toBuffer()],
      program.programId
    )

    const user_address = new web3.PublicKey("2ZZ63wbxbonZsD1XBdr4JeeNP6f5FY5NXh2M3Jjz7ez9");

    const [user_vault_pda, bump3] = await web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user_vault"), user_address.toBuffer() ,token_mint_address.toBuffer()],
      program.programId
    )

    const amount_to_withdraw = new BN(10_000_000_000);

    const userATA = new web3.PublicKey("GzsqFZFN8D3xhqQWDxHXwcT86BjbDWzf9ykXxPjda1EZ");

    // Send Transaction
    const txHash = await program.methods
    .withdrawFromVault(amount_to_withdraw)
    .accounts({
      user: program.provider.publicKey,
      userVaultState: user_vault_pda,
      userTokenAccount: userATA,
      vaultTokenAccount: vault_token_account,
      vaultAuth: vault_PDA,
      mint: token_mint_address,
      tokenProgram: new web3.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
    })
    .rpc();

    console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);

    // Confirm Transaction
    await program.provider.connection.confirmTransaction(txHash);
  });
});