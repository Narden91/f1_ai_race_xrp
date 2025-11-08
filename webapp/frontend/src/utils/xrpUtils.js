export const formatAddress = (address, length = 10) => {
  if (!address) return ''
  return `${address.slice(0, length)}...${address.slice(-4)}`
}

export const formatBalance = (balance) => {
  if (balance === null || balance === undefined) return '0.00'
  return parseFloat(balance).toFixed(2)
}