import javax.swing.*;
import java.awt.*;

public class Cinema {
    // Atributos do pedido atual
    boolean ingressoNormal;
    boolean meiaEntrada;
    boolean ingressoVip;
    int poltronaSelecionada;

    // Arrays para controlar as poltronas ocupadas (true = ocupada, false = livre)
    boolean[] poltronasNormaisOcupadas = new boolean[250];
    boolean[] poltronasVipOcupadas = new boolean[30];

    public static void main(String[] args) {
        Cinema sistema = new Cinema();

        // 1. Configuração da Janela
        JFrame janela = new JFrame("Cinema - Ingressos e Poltronas");
        janela.setSize(380, 320);
        janela.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        janela.setLayout(new BoxLayout(janela.getContentPane(), BoxLayout.Y_AXIS));

        // 2. Criação dos Componentes de Ingresso
        JLabel titulo = new JLabel("1. Selecione o tipo de ingresso:");
        JRadioButton rbNormal = new JRadioButton("Ingresso Normal - 250 lugares (R$ 30,00)");
        JRadioButton rbVip = new JRadioButton("Ingresso VIP - 30 lugares (R$ 60,00)");

        ButtonGroup grupoIngresso = new ButtonGroup();
        grupoIngresso.add(rbNormal);
        grupoIngresso.add(rbVip);

        JCheckBox cbMeia = new JCheckBox("Opção de meia entrada (50% de desconto)");

        // 3. Criação dos Componentes de Poltrona
        JLabel lblPoltrona = new JLabel("2. Escolha a poltrona:");
        JComboBox<String> comboPoltronas = new JComboBox<>();
        comboPoltronas.setMaximumSize(new Dimension(250, 30));
        comboPoltronas.addItem("Selecione Normal ou VIP primeiro");

        JButton btnConfirmar = new JButton("Confirmar Compra");

        // Método auxiliar para atualizar a lista de poltronas livres
        Runnable atualizarPoltronas = () -> {
            comboPoltronas.removeAllItems();
            if (rbNormal.isSelected()) {
                for (int i = 0; i < sistema.poltronasNormaisOcupadas.length; i++) {
                    if (!sistema.poltronasNormaisOcupadas[i]) {
                        comboPoltronas.addItem("Normal - Poltrona " + (i + 1));
                    }
                }
            } else if (rbVip.isSelected()) {
                for (int i = 0; i < sistema.poltronasVipOcupadas.length; i++) {
                    if (!sistema.poltronasVipOcupadas[i]) {
                        comboPoltronas.addItem("VIP - Poltrona " + (i + 1));
                    }
                }
            }
        };

        // Atualiza a lista sempre que clicar em Normal ou VIP
        rbNormal.addActionListener(e -> atualizarPoltronas.run());
        rbVip.addActionListener(e -> atualizarPoltronas.run());

        // 4. Adicionar componentes à janela
        janela.add(titulo);
        janela.add(rbNormal);
        janela.add(rbVip);
        janela.add(cbMeia);
        janela.add(Box.createRigidArea(new Dimension(0, 15))); // Espaçamento
        janela.add(lblPoltrona);
        janela.add(comboPoltronas);
        janela.add(Box.createRigidArea(new Dimension(0, 15)));
        janela.add(btnConfirmar);

        // 5. Ação ao clicar no botão Confirmar
        btnConfirmar.addActionListener(e -> {
            sistema.ingressoNormal = rbNormal.isSelected();
            sistema.ingressoVip = rbVip.isSelected();
            sistema.meiaEntrada = cbMeia.isSelected();

            // Validação de tipo de ingresso
            if (!sistema.ingressoNormal && !sistema.ingressoVip) {
                JOptionPane.showMessageDialog(janela, "Selecione ingresso Normal ou VIP!");
                return;
            }

            // Validação de disponibilidade
            if (comboPoltronas.getSelectedItem() == null) {
                JOptionPane.showMessageDialog(janela, "Sessão esgotada para este setor!");
                return;
            }

            // Extrai o número da poltrona escolhida e marca como ocupada (true)
            String itemEscolhido = (String) comboPoltronas.getSelectedItem();
            int numeroPoltrona = Integer.parseInt(itemEscolhido.replaceAll("[^0-9]", ""));
            sistema.poltronaSelecionada = numeroPoltrona;

            double valorFinal = 0;

            if (sistema.ingressoVip) {
                valorFinal = 60.00;
                sistema.poltronasVipOcupadas[numeroPoltrona - 1] = true; // Bloqueia a poltrona VIP
            } else if (sistema.ingressoNormal) {
                valorFinal = 30.00;
                sistema.poltronasNormaisOcupadas[numeroPoltrona - 1] = true; // Bloqueia a poltrona Normal
            }

            if (sistema.meiaEntrada) {
                valorFinal = valorFinal / 2;
            }

            // Monta o comprovante
            String resumo = "=== Compra Confirmada ===\n"
                          + "Setor: " + (sistema.ingressoVip ? "VIP" : "Normal") + "\n"
                          + "Poltrona: Nº " + sistema.poltronaSelecionada + "\n"
                          + "Meia Entrada: " + (sistema.meiaEntrada ? "Sim" : "Não") + "\n"
                          + "Total pago: R$ " + String.format("%.2f", valorFinal);

            JOptionPane.showMessageDialog(janela, resumo);

            // Atualiza a lista para remover a poltrona que acabou de ser comprada
            atualizarPoltronas.run();
        });

        janela.setVisible(true);
    }
}
