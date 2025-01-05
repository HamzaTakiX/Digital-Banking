package com.dev.ebankbackend;

import com.dev.ebankbackend.dtos.BankAccountDTO;
import com.dev.ebankbackend.dtos.CurrentBankAccountDTO;
import com.dev.ebankbackend.dtos.CustomerDTO;
import com.dev.ebankbackend.dtos.SavingBankAccountDTO;
import com.dev.ebankbackend.entities.*;
import com.dev.ebankbackend.enums.AccountStatus;
import com.dev.ebankbackend.enums.OperationType;
import com.dev.ebankbackend.exceptions.CustomerNotFoundException;
import com.dev.ebankbackend.repositories.AccountOperationRepository;
import com.dev.ebankbackend.repositories.BankAccountRepository;
import com.dev.ebankbackend.repositories.CustomerRepository;
import com.dev.ebankbackend.services.BankAccountService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

@SpringBootApplication
public class EBankBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(EBankBackendApplication.class, args);
    }

    @Bean
    CommandLineRunner commandLineRunner(BankAccountService bankAccountService){
        return args -> {
            // Create a customer
            CustomerDTO customer = new CustomerDTO();
            customer.setName("Hamza Taki");
            customer.setEmail("hamza@email.com");
            CustomerDTO savedCustomer = bankAccountService.saveCustomer(customer);

            // Create a current account
            try {
                CurrentBankAccountDTO currentAccount = bankAccountService.saveCurrentBankAccount(10000, 1000, savedCustomer.getId());
                System.out.println("Created current account with ID: " + currentAccount.getId());
                
                // Add some operations
                bankAccountService.credit(currentAccount.getId(), 5000, "Initial deposit");
                bankAccountService.debit(currentAccount.getId(), 1000, "ATM withdrawal");
                bankAccountService.credit(currentAccount.getId(), 2000, "Salary deposit");
                
                // Create a savings account
                SavingBankAccountDTO savingAccount = bankAccountService.saveSavingBankAccount(5000, 2.5, savedCustomer.getId());
                System.out.println("Created savings account with ID: " + savingAccount.getId());
                
                bankAccountService.credit(savingAccount.getId(), 1000, "Savings deposit");
                
            } catch (CustomerNotFoundException e) {
                e.printStackTrace();
            }
        };
    }
}
