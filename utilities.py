import pandas as pd

def addRoundedFields(df):
    df['ra0']=df['amountFormatted'].round(0)
    df['ra1']=df['amountFormatted'].round(1)
    df['ra2']=df['amountFormatted'].round(2)
    df['ra3']=df['amountFormatted'].round(3)
    df['30s'] = df['blockTime'].dt.round('30s')
    df['1m'] = df['blockTime'].dt.round('1 min')
    df['5m'] = df['blockTime'].dt.round('5 min')
    df['30m'] = df['blockTime'].dt.round('30 min')
    df['1h'] = df['blockTime'].dt.round('1h')

    return df



# def aggregateTransferData(df, amountField='ra1', dateField='1hr'):
#     gf0=df.groupby([amountField, dateField, 'exchange']).agg({'hash':'count', 'amountFormatted':'sum'}).sort_values('hash', ascending=False).reset_index()
#     gf1=df.groupby([dateField, 'exchange']).agg({'amountFormatted':['count', 'sum', 'mean', 'min', 'max']})
#     gf1.columns=gf1.columns.droplevel(0)
#     gf1=gf1.reset_index()
#     gf1.columns=[dateField, 'exchange', 'count', 'sum', 'mean', 'min', 'max']
#     gf = gf0.merge(gf1, on=[dateField, 'exchange'])
#     gf['percentTotalCount'] = gf['hash']/gf['count']
#     gf['percentTotalSum'] = gf['amountFormatted']/gf['sum']
#     return gf

def aggregateTransferData(df, filters):
    if filters['decimals'] == 'none':
        amountField='amountFormatted'
    else:
        amountField=f'ra{filters["decimals"]}'
    
    timeFrame=filters['timeFrame']

    gf=df.groupby([amountField, timeFrame, 'exchange']).agg({'hash':'count'}).sort_values('hash', ascending=False).reset_index()
    gf.columns=['amount', 'datetime', 'exchange', 'transfers']
    return gf

def queryAggregatedData(gf, filters):
    queryFilters = []
    minDate = filters['minDate']
    if minDate != '':
        queryFilters.append(f'datetime >= "{minDate}"')
    maxDate = filters['maxDate']
    if maxDate != '':
        queryFilters.append(f'datetime < "{maxDate}"')
    minAmount = filters['minAmount']
    if minAmount != '':
        queryFilters.append(f'amount >= {minAmount}')
    if queryFilters:
        query="&".join(queryFilters)
        gf=gf.query(query)
    gf=gf.sort_values(filters['sorting'], ascending=False).head(50).reset_index()

    return gf

def returnTransfers(data, df):

    dateVal=data['filters']['datetime'][:19].replace('T', ' ')
    exc=data['filters']['exchange']
    amt=data['filters']['amount']

    dateField=data['fieldSettings']['timeFrame']
    if data['fieldSettings']['decimals']=="none":
        amountField="amountFormatted"
    else:
        amountField=f"ra{data['fieldSettings']['decimals']}"
    tf=df[(df[dateField]==dateVal) & (df['exchange']==exc) & (df[amountField]==amt)]

    return tf