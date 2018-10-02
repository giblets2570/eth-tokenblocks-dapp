let questions = {
  questions1: [{
    key: 'strategy',
    question: 'What is your investment strategy?',
    values: ['Money Market','Transferable and Liquid Securities','Complex Derivatives','Private Equity',]
  },{
    key: 'leverage',
    question: 'Are you looking to use leverage?',
    values: ['No','Yes but less than 10%','Yes more than 10%']
  },{
    key: 'investorType',
    question: 'What type of clients are you trying to reach?',
    values: ['Retail', 'Professional','Institutional']
  },{
    key: 'investorAmerican',
    question: 'Will any of these clients be a US person?',
    values: ['Yes', 'No']
  },{
    key: 'investorLimit',
    question: 'Do you want to limit the number of investors?',
    values: ['Yes', 'No']
  },{
    key: 'jurisdiction',
    question: 'Do you have a prefered jurisdiction for the fund?',
    values: ['UK','Luxembourg','Ireland','Jersey']
  },{
    key: 'ended',
    question: 'Will the fund be open/ close ended?',
    values: ['Open','Closed'],
  },{
    key: 'exchange',
    question: 'Will you list the fund on a regulated exchange?',
    values: ['Yes', 'No']
  }],
  questions2: [{
    key: 'chosenJurisdiction',
    question: 'Jurisdiction',
    values: ['UK','Luxembourg','Ireland','Jersey'],
    requirements: {
      key: 'jurisdiction',
      values: [
        ['UK'],
        ['Luxembourg'],
        ['Ireland'],
        ['Jersey'],
      ]
    }
  },{
    key: 'regStructure',
    question: 'Regulatory Structure',
    values: [
      'Jersey Private Funds',
      'Unregulated Funds - exchange traded fund',
      'Unregulated Funds - eligible investor fund',
      'Expert Funds',
      'Listed Funds',
      'Eligible Investor Funds',
      'Unclassified Funds',
      'Recognised Funds',
      'UCITS Part I fund ',
      'UCITS Part II fund with registered AIFM ',
      'UCITS Part II fund with authorised AIFM ',
      'SIF (Specialised Investment Fund) with registered AIFM ',
      'SIF (Specialised Investment Fund) with authorised AIFM ',
      'SICAR with registered AIFM ',
      'SICAR with authorised AIFM ',
      'UCITS - ETF ',
      'UCITS - MMF (Money Market Fund)',
      'QIAIF - Qualifying AIF',
      'RIAIF - Retail Investor AIF',
      'Unit Trusts',
      'OEICs',
      'Investment Trusts',
    ],
    requirements: {
      key: 'jurisdiction',
      values: [
        ['Jersey'],
        ['Jersey'],
        ['Jersey'],
        ['Jersey'],
        ['Jersey'],
        ['Jersey'],
        ['Jersey'],
        ['Jersey'],
        ['Luxembourg'],
        ['Luxembourg'],
        ['Luxembourg'],
        ['Luxembourg'],
        ['Luxembourg'],
        ['Luxembourg'],
        ['Luxembourg'],
        ['Ireland'],
        ['Ireland'],
        ['Ireland'],
        ['Ireland'],
        ['UK'],
        ['UK'],
        ['UK']
      ]
    }
  },{
    key: 'legStructure',
    question: 'Legal Structure',
    values: [
      'Company',
      'Unity Trust',
      'Partnership',
      'FCP',
      'SICAV',
      'SICAR',
      'Investment Company/ Variable Capital Company',
      'Irish Collective Asset-Management Vehicle (ICAV)',
      'Unit Trust',
      'Investment Limited Partnership',
      'Common Contractual Fund (CCFs)',
    ],
    requirements: {
      key: 'jurisdiction',
      values: [
        'Jersey',
        'Jersey',
        'Jersey',
        'Luxembourg',
        'Luxembourg',
        'Luxembourg',
        'Ireland',
        'Ireland',
        'Ireland',
        'Ireland',
        'Ireland'
      ]
    }

  }]
}

export default questions