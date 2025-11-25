
# app.py
import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
from sklearn.neighbors import NearestNeighbors
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import StandardScaler, normalize
import unicodedata

# ---------------------------------------------------
# 🔧 Normalização de texto
# ---------------------------------------------------
def normalizar(texto):
    if pd.isna(texto):
        return ""
    texto = str(texto).lower()
    texto = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode("utf-8")
    texto = " ".join(texto.split())
    return texto.strip()

# ---------------------------------------------------
# 🧭 Sidebar – Navegação e carga do CSV
# ---------------------------------------------------
st.set_page_config(page_title="Recomendador de Exames", page_icon="🧪", layout="wide")
st.sidebar.title("📌 Menu")

pagina = st.sidebar.radio("Ir para:", ["Recomendador de Exames", "Dashboard"])

st.sidebar.markdown("---")
st.sidebar.subheader("📂 Fonte de dados")

# Opção 1: Upload
uploaded = st.sidebar.file_uploader("Enviar CSV", type=["csv"])

# Opção 2: Caminho local (valor padrão apontando para o arquivo que geramos)
csv_path_default = "exames_500_pacientes_ids_numericos.csv"
csv_path_input = st.sidebar.text_input("Ou informe o caminho do CSV:", value=csv_path_default)

# Função de leitura com cache
@st.cache_data(show_spinner=False)
def carregar_dados(arquivo_upload, caminho_texto):
    if arquivo_upload is not None:
        df_ = pd.read_csv(arquivo_upload, encoding="utf-8-sig")
    else:
        df_ = pd.read_csv(caminho_texto, encoding="utf-8-sig")
    return df_

# Carrega DataFrame
try:
    df = carregar_dados(uploaded, csv_path_input)
except Exception as e:
    st.error(f"Não foi possível carregar o CSV. Verifique o caminho/arquivo. Detalhes: {e}")
    st.stop()

# ---------------------------------------------------
# ✅ Verificação de colunas necessárias
# ---------------------------------------------------
colunas_necessarias = [
    "id_exame","id_paciente","laboratorio","exame_texto","data_exame",
    "resultado","idade","patologia","medicamento","nome_paciente"
]
faltantes = [c for c in colunas_necessarias if c not in df.columns]
if faltantes:
    st.error("As seguintes colunas estão faltando no CSV: " + ", ".join(faltantes))
    st.stop()

# ---------------------------------------------------
# 🧼 Limpeza e tipos
# ---------------------------------------------------
# Converte data
df["data_exame"] = pd.to_datetime(df["data_exame"], errors="coerce")
# Normaliza campos usados na recomendação
df["patologia_norm"] = df["patologia"].apply(normalizar)
df["medicamento_norm"] = df["medicamento"].apply(normalizar)
# Idade: garante numérico
df["idade"] = pd.to_numeric(df["idade"], errors="coerce")
media_idade = df["idade"].mean()
df["idade"] = df["idade"].fillna(media_idade)

# ===================================================
# ===================  PAGINA 1 =====================
# ===================================================
if pagina == "Recomendador de Exames":

    st.title("🧠 Recomendador de Exames por Similaridade")

    # ---------------------------------------------------
    # 🔠 Vetorização TF-IDF para patologia e medicamento
    # ---------------------------------------------------
    tfidf_pat = TfidfVectorizer(ngram_range=(1,2), max_features=300, stop_words="portuguese")
    tfidf_med = TfidfVectorizer(ngram_range=(1,2), max_features=300, stop_words="portuguese")

    pat_vec = tfidf_pat.fit_transform(df["patologia_norm"])
    med_vec = tfidf_med.fit_transform(df["medicamento_norm"])

    # ---------------------------------------------------
    # 🎚 Normalização da idade com peso maior (×2)
    # ---------------------------------------------------
    idade_scaled = StandardScaler().fit_transform(df[["idade"]]) * 2.0

    # ---------------------------------------------------
    # 🧩 Matriz final de features (idade + patologia + medicamento)
    # ---------------------------------------------------
    X = np.hstack([idade_scaled, pat_vec.toarray(), med_vec.toarray()])
    X = normalize(X)

    exames = df["exame_texto"].astype(str).values

    # ---------------------------------------------------
    # 🎯 Sidebar – número de vizinhos
    # ---------------------------------------------------
    num_vizinhos = st.sidebar.slider("Número de pacientes semelhantes:", 1, 30, 5)

    # ---------------------------------------------------
    # 🧠 KNN
    # ---------------------------------------------------
    knn = NearestNeighbors(n_neighbors=num_vizinhos, metric="cosine")
    knn.fit(X)

    # ---------------------------------------------------
    # 📋 Amostra dos dados
    # ---------------------------------------------------
    with st.expander("📋 Ver amostra dos dados"):
        st.dataframe(
            df[
                ["id_paciente","nome_paciente","idade","patologia",
                 "medicamento","laboratorio","exame_texto","data_exame","resultado"]
            ].head(20)
        )

    # ---------------------------------------------------
    # 📝 Formulário de novo paciente
    # ---------------------------------------------------
    st.subheader("💡 Recomendar exame para novo paciente")

    col1, col2 = st.columns(2)
    with col1:
        idade_input = st.number_input("Idade:", min_value=0, max_value=120, value=40)
    with col2:
        patologia_input = st.text_input("Patologia:")

    medicamento_input = st.text_input("Medicamento:")
    num_exames = st.slider("Qtd. exames recomendados:", 1, 10, 3)

    # ---------------------------------------------------
    # 🔍 Ação de recomendar
    # ---------------------------------------------------
    if st.button("🔎 Recomendar"):
        if patologia_input.strip() == "" and medicamento_input.strip() == "":
            st.warning("Informe pelo menos patologia ou medicamento.")
        else:
            # Normaliza a idade informada no mesmo padrão
            desvio_idade = df["idade"].std() if df["idade"].std() > 0 else 1.0
            idade_norm = (idade_input - media_idade) / desvio_idade * 2.0

            # Transforma entrada em TF-IDF
            pat_new = tfidf_pat.transform([normalizar(patologia_input)]).toarray()
            med_new = tfidf_med.transform([normalizar(medicamento_input)]).toarray()

            # Vetor final do novo paciente
            X_new = np.hstack([[idade_norm], pat_new[0], med_new[0]]).reshape(1, -1)
            X_new = normalize(X_new)

            # Busca vizinhos
            dist, idx = knn.kneighbors(X_new)

            # Contagem dos exames dos pacientes mais semelhantes
            exames_recomendados = pd.Series(exames[idx[0]]).value_counts().head(num_exames)

            # Exibe recomendações
            st.success("🧩 Exames recomendados:")
            st.table(exames_recomendados.rename_axis("Exame").reset_index(name="Frequência"))

            # Mostra os pacientes mais parecidos
            st.info("👥 Pacientes semelhantes:")
            cols_pac = ["id_paciente","nome_paciente","idade","patologia","medicamento",
                        "laboratorio","exame_texto","data_exame","resultado"]
            st.dataframe(df.iloc[idx[0]][cols_pac])

# ===================================================
# ===================  PAGINA 2 =====================
# ===================================================
elif pagina == "Dashboard":

    st.title("📊 Dashboard dos Exames")

    # Filtros
    colf1, colf2 = st.columns(2)
    with colf1:
        lab_sel = st.multiselect("Laboratórios:", sorted(df["laboratorio"].dropna().unique()))
    with colf2:
        exame_sel = st.multiselect("Exames:", sorted(df["exame_texto"].dropna().unique()))

    dff = df.copy()
    if lab_sel:
        dff = dff[dff["laboratorio"].isin(lab_sel)]
    if exame_sel:
        dff = dff[dff["exame_texto"].isin(exame_sel)]

    # 1) Contagem por laboratório
    st.subheader("🔬 Quantidade de exames por laboratório")
    fig1 = px.bar(
        dff.groupby("laboratorio")["id_exame"].count().reset_index(name="qtd"),
        x="laboratorio", y="qtd", color="laboratorio",
        title="Exames por laboratório"
    )
    st.plotly_chart(fig1, use_container_width=True)

    # 2) Top 15 exames
    st.subheader("📑 Top exames")
    top_exames = dff["exame_texto"].value_counts().head(15).reset_index()
    top_exames.columns = ["exame_texto", "qtd"]
    fig2 = px.bar(top_exames, x="exame_texto", y="qtd", color="exame_texto",
                  title="Top 15 exames")
    fig2.update_layout(xaxis_tickangle=-30)
    st.plotly_chart(fig2, use_container_width=True)

    # 3) Distribuição de idade
    st.subheader("🎂 Distribuição de idades")
    fig3 = px.histogram(dff, x="idade", nbins=20, title="Histograma de idades")
    st.plotly_chart(fig3, use_container_width=True)

    # 4) Série temporal (por mês)
    st.subheader("🗓️ Exames por mês")
    dff["mes"] = dff["data_exame"].dt.to_period("M").astype(str)
    fig4 = px.line(
        dff.groupby("mes")["id_exame"].count().reset_index(name="qtd"),
        x="mes", y="qtd", title="Exames por mês"
    )
    st.plotly_chart(fig4, use_container_width=True)

    # 5) Tabela filtrada
    st.subheader("📋 Tabela filtrada")
    st.dataframe(dff[
        ["id_exame","id_paciente","nome_paciente","idade","patologia","medicamento",
         "laboratorio","exame_texto","data_exame","resultado"]
    ])
