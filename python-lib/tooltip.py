def get_tooltips(df, tooltips):
    tooltip = {}
    df_columns = list(df.columns())
    for column in tooltips:
        if column in df_columns:
            tooltip[column] = df[column]
    return tooltip