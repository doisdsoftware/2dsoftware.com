/** Dados legais alinhados ao CCMEI (MEI) — usados no rodapé e documentos. */
export const LEGAL = {
  /** Nome fantasia / marca comercial */
  tradeName: '2D Software',
  /** Nome empresarial no CCMEI */
  legalName: '65.403.517 DANIEL APARECIDO BAISSO',
  /** Nome civil do empresário (MEI) */
  entrepreneurName: 'Daniel Aparecido Baisso',
  cnpj: '65.403.517/0001-77',
  cnpjDigits: '65403517000177',
  street: 'Rua João Rodrigues da Silva, 315',
  district: 'Vila Fracalanza',
  city: 'Campos do Jordão',
  state: 'SP',
  cep: '12467-200',
  email: 'softwarehouse@2dsoftware.com.br',
  whatsappDisplay: '(12) 99167-6955',
  whatsappUrl: 'https://wa.me/5512991676955',
} as const;

export const LEGAL_ADDRESS_LINE = `${LEGAL.street} — ${LEGAL.district}, ${LEGAL.city}/${LEGAL.state} — CEP ${LEGAL.cep}`;
