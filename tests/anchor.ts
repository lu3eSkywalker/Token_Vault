import * as anchor from "@coral-xyz/anchor";
import * as web3 from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { TokenVault } from "../target/types/Token_Vault";
import { BN } from "bn.js";

describe("Test", () => {
  // Configure the client to use the local cluster
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Token_Vault as anchor.Program<TokenVault>;

  const token_mint_address = new web3.PublicKey("4uUgYR1DMsWNq4UMx6coUFaouN4K6WybqpWyVDnDdG4z");

  it("initializes a Vault Account", async () => {
    const [vault_token_account, bump1] = await web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), token_mint_address.toBuffer()],
      program.programId
    )

    const [vaultPDA, bump2] = await web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), token_mint_address.toBuffer()],
      program.programId
    );

    console.log("This is the Token vault_token_account: ", vault_token_account.toString());
    console.log("This is the vaultPDA: ", vaultPDA.toString());

    // Send Transaction
    const txHash = await program.methods
    .initializeVault()
    .accounts({
      vaultTokenAccount: vault_token_account,
      vault_auth: vaultPDA,
      payer: program.provider.publicKey,
      mint: token_mint_address,
      systemProgram: web3.SystemProgram.programId,
      tokenProgram: new web3.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
      rent: web3.SYSVAR_RENT_PUBKEY,      
    })
    .rpc();

    console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);

    // Confirm Transaction
    await program.provider.connection.confirmTransaction(txHash);
  });

  it("deposit to vault", async () => {

    const [vault_token_account, bump1] = await web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), token_mint_address.toBuffer()],
      program.programId
    )

    const amount_to_deposit = new BN(10_000_000_000);

    const userATA = new web3.PublicKey("GzsqFZFN8D3xhqQWDxHXwcT86BjbDWzf9ykXxPjda1EZ");

    // Send Transaction
    const txHash = await program.methods
    .depositToVault(amount_to_deposit)
    .accounts({
      user: program.provider.publicKey,
      userTokenAccount: userATA,
      vaultTokenAccount: vault_token_account,
      mint: token_mint_address,
      tokenProgram: new web3.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),      
    })
    .rpc();

    console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);

    // Confirm Transaction
    await program.provider.connection.confirmTransaction(txHash);
  });
});